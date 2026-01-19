-- Startup Setu Database Schema
-- Run these SQL queries in Supabase SQL Editor

-- Users table (assumed to exist)
-- CREATE TABLE users (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   email TEXT UNIQUE NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- Startup memory (assumed to exist)
-- CREATE TABLE startup_memory (
--   user_id UUID PRIMARY KEY REFERENCES users(id),
--   idea TEXT,
--   stage TEXT,
--   industry TEXT,
--   problem TEXT,
--   solution TEXT,
--   updated_at TIMESTAMP DEFAULT NOW()
-- );

-- NEW: Chat history table
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_reply TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_chat_user ON chat_history(user_id, agent_name, created_at DESC);

-- NEW: Agent access table (assumed to exist or create)
-- CREATE TABLE agent_access (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   agent_name TEXT NOT NULL,
--   unlocked BOOLEAN DEFAULT FALSE,
--   created_at TIMESTAMP DEFAULT NOW(),
--   UNIQUE(user_id, agent_name)
-- );
