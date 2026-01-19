import express from "express";
import { supabase } from "../clients/supabaseClient.js";
import { createChatCompletion } from "../clients/groqClient.js";
import { getSystemPrompt } from "../agents/prompts.js";
import { validateChatRequest } from "../utils/validate.js";
import { extractMemoryFromText } from "../utils/memoryExtractor.js";

const router = express.Router();

// Helper: Fetch recent chat history for context
async function fetchChatHistory(userId, agentName, limit = 10) {
  try {
    const { data, error } = await supabase
      .from("chat_history")
      .select("user_message, ai_reply, created_at")
      .eq("user_id", userId)
      .eq("agent_name", agentName)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Error fetching chat history:", error.message);
      return [];
    }

    // Reverse to get chronological order (oldest first)
    return (data || []).reverse();
  } catch (err) {
    console.warn("Failed to fetch chat history:", err);
    return [];
  }
}

// Helper: Save chat message to database
async function saveChatMessage(userId, agentName, userMessage, aiReply) {
  try {
    const { error } = await supabase.from("chat_history").insert({
      user_id: userId,
      agent_name: agentName,
      user_message: userMessage,
      ai_reply: aiReply,
    });

    if (error) console.warn("Error saving chat:", error.message);
  } catch (err) {
    console.warn("Failed to save chat message:", err);
  }
}

// POST /api/chat
router.post("/chat", async (req, res) => {
  try {
    const body = req.body;
    const errors = validateChatRequest(body);
    if (errors.length)
      return res.status(400).json({ error: errors.join("; ") });

    const { user_id, session_id, message, preferred_agent } = body;

    // Check subscription/access for requested agent
    if (preferred_agent && preferred_agent !== "business-blueprinting") {
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("is_active")
        .eq("user_id", user_id)
        .eq("agent_id", preferred_agent)
        .maybeSingle();

      if (subError)
        console.warn("Error checking subscription:", subError.message);

      const hasAccess = subscription?.is_active === true;
      if (!hasAccess) {
        return res.json({
          reply:
            "This agent requires a premium subscription. Please upgrade to unlock access.",
          agent: preferred_agent,
          upgrade_required: true,
        });
      }
    }

    // Fetch startup memory
    const { data: memoryRow, error: memErr } = await supabase
      .from("startup_memory")
      .select("user_id, idea, stage, industry, problem, solution, updated_at")
      .eq("user_id", user_id)
      .maybeSingle();

    if (memErr)
      console.warn("Error fetching startup_memory:", memErr.message || memErr);

    const memory = memoryRow || {};

    // Decide agent
    const AGENT_BLUEPRINT = "Business Blueprinting Agent";
    const AGENT_SUPPORT = "Business Support Services Agent";

    let agent = AGENT_BLUEPRINT;
    if (preferred_agent && preferred_agent === AGENT_SUPPORT)
      agent = AGENT_SUPPORT;

    // If user requested support agent, check unlock
    if (agent === AGENT_SUPPORT) {
      const { data: accessRow, error: accessErr } = await supabase
        .from("agent_access")
        .select("user_id, agent_name, unlocked")
        .eq("user_id", user_id)
        .eq("agent_name", AGENT_SUPPORT)
        .maybeSingle();

      if (accessErr)
        console.warn(
          "Error fetching agent_access:",
          accessErr.message || accessErr
        );

      const unlocked = accessRow?.unlocked === true;
      if (!unlocked) {
        return res.json({
          reply:
            "Based on your current stage, you need the Business Support Services Agent to continue. Please upgrade or unlock access to this agent to proceed.",
          agent: AGENT_SUPPORT,
          upgrade_required: true,
        });
      }
    }

    // Fetch recent chat history for context
    const chatHistory = await fetchChatHistory(user_id, agent);

    // Build system prompt with injected memory and context
    const systemPrompt = getSystemPrompt(agent, memory, chatHistory);

    // Build messages array with recent history
    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory
        .map((h) => [
          { role: "user", content: h.user_message },
          { role: "assistant", content: h.ai_reply },
        ])
        .flat(),
      { role: "user", content: message },
    ];

    // Call Groq
    const aiRaw = await createChatCompletion({ messages });

    // Ensure JSON-safe plain text reply
    const reply = aiRaw ? String(aiRaw) : "";

    // Save chat to database
    await saveChatMessage(user_id, agent, message, reply);

    // Attempt to extract memory updates from the user's message
    const extracted = extractMemoryFromText(message);
    if (extracted) {
      // Only update fields that changed
      const updated = { user_id };
      let shouldUpdate = false;
      for (const key of ["idea", "stage", "industry", "problem", "solution"]) {
        if (extracted[key] && extracted[key] !== (memory[key] || "")) {
          updated[key] = extracted[key];
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        const { error: upErr } = await supabase
          .from("startup_memory")
          .upsert(updated, { returning: "minimal" });
        if (upErr)
          console.warn(
            "Failed to update startup_memory:",
            upErr.message || upErr
          );
      }
    }

    return res.json({ reply, agent, upgrade_required: false });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    return res.status(500).json({ error: "Failed to process chat" });
  }
});

// GET /api/chat-history - Fetch chat history for a user and agent
router.get("/chat-history", async (req, res) => {
  try {
    const { user_id, agent_id } = req.query;

    if (!user_id || !agent_id) {
      return res.status(400).json({ error: "user_id and agent_id required" });
    }

    const { data, error } = await supabase
      .from("chat_history")
      .select("user_message, ai_reply, created_at")
      .eq("user_id", user_id)
      .eq("agent_name", agent_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Error fetching chat history:", error.message);
      return res.status(500).json({ error: "Failed to fetch history" });
    }

    // Format response to match frontend expectations
    const history = (data || []).map((item) => ({
      user_message: item.user_message,
      ai_reply: item.ai_reply,
      message: item.user_message,
      reply: item.ai_reply,
      timestamp: item.created_at,
    }));

    res.json({ history });
  } catch (err) {
    console.error("Error in /api/chat-history:", err);
    return res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

export default router;
