import express from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { supabase } from "../clients/supabaseClient.js";

const router = express.Router();

/**
 * POST /api/auth/login
 * Login or register user by email and password
 * Body: { email, password, isSignup? }
 * Returns: { userId, email, subscriptions: { agentId: boolean } }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password, isSignup } = req.body;

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: "Valid email address required" });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id, email, password_hash")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }

    let userId;

    if (existingUser) {
      // User exists - verify password
      if (!isSignup) {
        // Login mode: verify password
        const passwordMatch = await bcrypt.compare(password, existingUser.password_hash);
        if (!passwordMatch) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
        userId = existingUser.id;
        console.log(`User ${email} logged in successfully`);
      } else {
        // Signup mode but email exists
        return res.status(409).json({ error: "Email already registered. Please login instead." });
      }

      // Ensure existing user has free agent access
      const { error: ensureFreeError } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: userId,
          agent_id: "business-blueprinting",
          is_active: true,
        });

      if (ensureFreeError) {
        console.warn("Warning ensuring free subscription:", ensureFreeError);
      }
    } else {
      // User doesn't exist
      if (!isSignup) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Create new user with signup
      userId = randomUUID();
      const passwordHash = await bcrypt.hash(password, 10);

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([{ id: userId, email, password_hash: passwordHash }])
        .select("id")
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      // Grant free agent access to new user
      const { error: freeSubError } = await supabase
        .from("subscriptions")
        .insert([
          {
            user_id: userId,
            agent_id: "business-blueprinting",
            is_active: true,
          },
        ]);

      if (freeSubError) {
        console.error("Error granting free subscription:", freeSubError);
      }

      console.log(`New user ${email} signed up successfully`);
    }

    // Fetch user's subscriptions (which agents they have access to)
    const { data: subscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("agent_id, is_active")
      .eq("user_id", userId);

    if (subError && subError.code !== "PGRST116") {
      console.warn("Subscription fetch error (non-critical):", subError);
      // Don't throw - we'll still return free agent access
    }

    console.log(`User ${email} (${userId}) subscriptions from DB:`, subscriptions);

    // Convert subscriptions array to object (only include ACTIVE subscriptions)
    const subscriptionsMap = {};
    
    // ALWAYS grant free agent access
    subscriptionsMap["business-blueprinting"] = true;
    
    if (subscriptions && subscriptions.length > 0) {
      subscriptions.forEach((sub) => {
        // Only add to map if is_active is true
        if (sub.is_active === true) {
          subscriptionsMap[sub.agent_id] = true;
        }
      });
    }

    console.log(`Final subscriptions map for ${email}:`, subscriptionsMap);

    res.json({
      userId,
      email,
      subscriptions: subscriptionsMap,
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({
      error: error.message || "Authentication failed",
    });
  }
});

export default router;
