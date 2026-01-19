import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

if (!GROQ_API_KEY) console.warn("GROQ_API_KEY not set — Groq calls will fail.");

export async function createChatCompletion({
  messages,
  temperature = 0.2,
  max_tokens = 800,
}) {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const body = {
    model: GROQ_MODEL,
    messages,
    temperature,
    max_tokens,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const assistant = data?.choices?.[0]?.message?.content || "";
  return assistant;
}
