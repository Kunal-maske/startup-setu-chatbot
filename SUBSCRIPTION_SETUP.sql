-- Create subscriptions table to track which agents each user has access to
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, agent_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_agent ON subscriptions(agent_id);

-- Grant access to service role (if needed for RLS)
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON subscriptions TO service_role;

-- Insert free agent access for all existing users
INSERT INTO subscriptions (user_id, agent_id, is_active)
SELECT id, 'business-blueprinting', TRUE FROM users
ON CONFLICT (user_id, agent_id) DO NOTHING;

-- Example: Give user_123 access to all agents
INSERT INTO subscriptions (user_id, agent_id, is_active) VALUES
('user_123', 'founder-coach', TRUE),
('user_123', 'market-researcher', TRUE),
('user_123', 'financial-planner', TRUE),
('user_123', 'product-strategist', TRUE),
('user_123', 'marketing-expert', TRUE),
('user_123', 'legal-advisor', TRUE),
('user_123', 'tech-advisor', TRUE),
('user_123', 'investor-relations', TRUE),
('user_123', 'operations-manager', TRUE),
('user_123', 'hr-consultant', TRUE),
('user_123', 'customer-success', TRUE)
ON CONFLICT (user_id, agent_id) DO NOTHING;
