# Database Setup Guide

## What Changed

Your app now saves **all conversations and startup data to Supabase**:

1. **Chat History** — Every message exchange is stored
2. **Startup Memory** — Idea, stage, industry, problem, solution tracked
3. **Context Awareness** — AI knows what step user is at, previous discussions

---

## Setup Instructions

### Step 1: Create Users Table (if not exists)

Go to **Supabase Console** → SQL Editor → Run:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 2: Create Startup Memory Table (if not exists)

```sql
CREATE TABLE IF NOT EXISTS startup_memory (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  idea TEXT,
  stage TEXT,
  industry TEXT,
  problem TEXT,
  solution TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 3: Create Chat History Table (NEW)

```sql
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_reply TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_chat_user ON chat_history(user_id, agent_name, created_at DESC);
```

### Step 4: Create Agent Access Table (if not exists)

```sql
CREATE TABLE IF NOT EXISTS agent_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, agent_name)
);
```

### Step 5: Insert Test User (for testing)

```sql
INSERT INTO users (id, email)
VALUES ('user_123', 'test@example.com')
ON CONFLICT DO NOTHING;

-- Give test user access to both agents
INSERT INTO agent_access (user_id, agent_name, unlocked)
VALUES
  ('user_123', 'Business Blueprinting Agent', true),
  ('user_123', 'Business Support Services Agent', true)
ON CONFLICT DO NOTHING;
```

---

## How It Works

### User Message Flow:

```
1. User sends: "I'm building a SaaS for fitness"
   ↓
2. Backend fetches:
   - Last 10 chat messages
   - User's startup memory
   - Agent access level
   ↓
3. AI sees:
   "Current startup profile: Idea: SaaS for fitness..."
   "Recent context: discussed..."
   ↓
4. AI generates contextual response
   ↓
5. Conversation saved to chat_history table
```

---

## What the AI Now Knows

**After first conversation:**

- User's startup idea
- Stage (idea, MVP, growth, etc.)
- Industry/problem/solution

**After multiple conversations:**

- User's progress journey
- What was already discussed
- What questions were asked
- Next logical step

---

## Testing

1. Start backend: `npm run dev`
2. Open frontend: `index.html`
3. Send messages via agent
4. Check Supabase → chat_history table → Messages appear!
5. Switch agents, come back → Old chats appear in context

---

## Future Enhancements

- Track user progress stages (idea → MVP → fundraising → growth)
- Auto-save startup details from conversations
- Generate progress reports
- Recommend next steps based on stage
- Export conversation history

---

## Important Notes

⚠️ Make sure Supabase credentials are in `.env`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

🔒 **Never commit `.env` to Git!** Add to `.gitignore`
