import express from "express";
import { randomUUID } from "crypto";
import { supabase } from "../clients/supabaseClient.js";

const router = express.Router();

/**
 * POST /api/auth/login
 * Login or register user by email
 * Body: { email }
 * Returns: { userId, email, subscriptions: { agentId: boolean } }
 */
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: "Valid email address required" });
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is expected for new users
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }

    let userId;

    if (existingUser) {
      // User exists, use their ID
      userId = existingUser.id;

      // Ensure existing user has free agent access
      const { error: ensureFreeError } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: userId,
          agent_id: "business-blueprinting",
          is_active: true,
        });

      if (ensureFreeError) {
        console.warn(
          "Warning ensuring free subscription for existing user:",
          ensureFreeError
        );
      }
    } else {
      // Create new user with generated UUID
      userId = randomUUID();
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([{ id: userId, email }])
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

        // Don't throw - this is not critical for login
      }

      userId = newUser.id;
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
