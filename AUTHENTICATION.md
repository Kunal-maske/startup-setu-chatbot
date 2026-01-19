# Authentication & Subscription System

This guide explains how the email login and subscription system works in Startup Setu.

## Overview

✅ **Email Login** — Users sign in with their email address  
✅ **User Registration** — New users are automatically registered on first login  
✅ **Subscription Tiers** — Business Blueprinting Agent is FREE for all users; all other 10 agents require premium subscription  
✅ **Per-Agent Access Control** — Backend checks subscription before allowing chat with paid agents

---

## Architecture

### Database Schema

#### `users` table

```sql
- id (TEXT, primary key) — User ID
- email (TEXT, unique) — Email address
- created_at (TIMESTAMP) — Registration date
```

#### `subscriptions` table

```sql
- id (UUID, primary key)
- user_id (TEXT, FK → users.id)
- agent_id (TEXT) — Agent ID (e.g., 'founder-coach', 'market-researcher')
- is_active (BOOLEAN) — Whether subscription is active
- created_at, updated_at (TIMESTAMPS)
- UNIQUE(user_id, agent_id) — One subscription per user per agent
```

### Free vs. Paid Agents

| Agent ID                | Agent Name                  | Pricing  |
| ----------------------- | --------------------------- | -------- |
| `business-blueprinting` | Business Blueprinting Agent | **FREE** |
| `founder-coach`         | Founder Coach Agent         | Paid     |
| `market-researcher`     | Market Researcher Agent     | Paid     |
| `financial-planner`     | Financial Planner Agent     | Paid     |
| `product-strategist`    | Product Strategist Agent    | Paid     |
| `legal-advisor`         | Legal Advisor Agent         | Paid     |
| `tech-advisor`          | Tech Advisor Agent          | Paid     |
| `investor-relations`    | Investor Relations Agent    | Paid     |
| `operations-manager`    | Operations Manager Agent    | Paid     |
| `hr-consultant`         | HR Consultant Agent         | Paid     |
| `customer-success`      | Customer Success Agent      | Paid     |

---

## API Endpoints

### `POST /api/auth/login`

**Purpose**: Login or register a user by email  
**Auth**: None (public endpoint)

**Request Body**:

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:

```json
{
  "userId": "uuid-or-email-based-id",
  "email": "user@example.com",
  "subscriptions": {
    "founder-coach": true,
    "market-researcher": false,
    "financial-planner": true
  }
}
```

**Error Response (400)**:

```json
{
  "error": "Valid email address required"
}
```

**Behavior**:

1. Check if user exists by email
2. If exists → return user ID + subscriptions
3. If new → create user, grant FREE agent access, return user ID

---

### `POST /api/chat`

**Purpose**: Send a message to an agent  
**Auth**: None (user_id passed in body)

**Request Body**:

```json
{
  "user_id": "user-id-from-login",
  "session_id": "session-123",
  "message": "Help me validate my startup idea",
  "preferred_agent": "business-blueprinting"
}
```

**Response (200 OK)** — If user has access:

```json
{
  "reply": "Agent response...",
  "agent": "business-blueprinting"
}
```

**Response (200 OK)** — If user lacks subscription:

```json
{
  "reply": "This agent requires a premium subscription. Please upgrade to unlock access.",
  "agent": "founder-coach",
  "upgrade_required": true
}
```

**Access Control Logic**:

- If agent is `business-blueprinting` → Always allow
- If agent is paid → Check `subscriptions` table for `(user_id, agent_id, is_active=true)`
- If not found or `is_active=false` → Deny and return `upgrade_required: true`

---

## Frontend Flow

### 1. Login Modal (First Load)

```
User opens app
  ↓
Check localStorage for `currentUser`
  ↓
If not found → Show Login Modal
  ↓
User enters email → Submit
  ↓
POST /api/auth/login
  ↓
Store currentUser + userSubscriptions in localStorage
  ↓
Hide Modal → Show Main Chat UI
```

### 2. Agent List Rendering

```
When renderAgents() runs:
  ↓
For each agent:
  - If agent_id === 'business-blueprinting' → Show "Free" badge
  - Else if userSubscriptions[agent_id] === true → Show "Premium" badge
  - Else → Show "🔒 Locked" badge + reduce opacity
  ↓
On click:
  - If locked → Show alert "Subscribe to unlock"
  - Else → Switch agent + load chat
```

### 3. Sending a Message

```
User types message + clicks Send
  ↓
POST /api/chat with:
  - user_id: currentUser.id (from auth)
  - preferred_agent: currentAgent.id
  ↓
Backend checks subscription
  ↓
If access denied → response.upgrade_required = true
  - Show upgrade message to user
  ↓
If access granted → Process chat normally
  - Show AI reply
  - Save to DB
```

### 4. Logout

```
User clicks "Logout" button
  ↓
Clear localStorage (currentUser, userSubscriptions)
  ↓
Show Login Modal again
```

---

## Setup Instructions

### 1. Create Supabase Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Users table (should already exist)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_agent ON subscriptions(agent_id);

-- Grant access
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON subscriptions TO service_role;
```

Or use the provided [SUBSCRIPTION_SETUP.sql](../SUBSCRIPTION_SETUP.sql) file.

### 2. Test User Setup (Optional)

To test with a pre-subscribed user, run:

```sql
-- Create test user
INSERT INTO users (id, email) VALUES ('test_user_1', 'test@example.com') ON CONFLICT DO NOTHING;

-- Give test user access to ALL agents
INSERT INTO subscriptions (user_id, agent_id, is_active) VALUES
('test_user_1', 'business-blueprinting', TRUE),
('test_user_1', 'founder-coach', TRUE),
('test_user_1', 'market-researcher', TRUE),
('test_user_1', 'financial-planner', TRUE),
('test_user_1', 'product-strategist', TRUE),
('test_user_1', 'legal-advisor', TRUE),
('test_user_1', 'tech-advisor', TRUE),
('test_user_1', 'investor-relations', TRUE),
('test_user_1', 'operations-manager', TRUE),
('test_user_1', 'hr-consultant', TRUE),
('test_user_1', 'customer-success', TRUE)
ON CONFLICT (user_id, agent_id) DO NOTHING;
```

### 3. Test the System

1. **Start the app**: `npm run dev`
2. **Open browser**: `http://localhost:3000`
3. **See login modal**: Enter any email (e.g., `john@example.com`)
4. **Verify**:
   - User is created in Supabase `users` table
   - Business Blueprinting Agent shows as "Free"
   - Other agents show as "🔒 Locked"
   - Try switching agents — locked ones show alert

---

## Adding Premium Subscriptions

To give a user premium access to an agent:

```sql
INSERT INTO subscriptions (user_id, agent_id, is_active) VALUES
('user-id-here', 'founder-coach', TRUE)
ON CONFLICT (user_id, agent_id) DO UPDATE SET is_active = TRUE;
```

Or via backend (you would need to create this endpoint):

```javascript
// Example endpoint to add subscription (not yet implemented)
POST / api / subscriptions / grant;
Body: {
  user_id, agent_id;
}
```

---

## Removing Premium Access

To revoke access:

```sql
DELETE FROM subscriptions
WHERE user_id = 'user-id-here' AND agent_id = 'agent-id-here';

-- Or deactivate (keep record):
UPDATE subscriptions SET is_active = FALSE
WHERE user_id = 'user-id-here' AND agent_id = 'agent-id-here';
```

---

## Future Enhancements

1. **Payment Integration** — Stripe/Razorpay to handle subscription purchases
2. **Subscription Tiers** — Free, Starter, Pro, Enterprise with different agent bundles
3. **Trial Period** — 7-day free trial for premium agents
4. **Usage Analytics** — Track which agents users interact with most
5. **Referral Program** — Give users discount codes to share
6. **Admin Dashboard** — Manage user subscriptions + view analytics

---

## Troubleshooting

### "Cannot fetch from /api/auth/login"

- Ensure backend is running: `npm run dev`
- Check `.env` has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### Login succeeds but agents still locked

- Check `subscriptions` table in Supabase — rows may not exist
- Run SUBSCRIPTION_SETUP.sql to create initial subscriptions
- Verify `user_id` matches in `users` and `subscriptions` tables

### "This agent requires a premium subscription" when it shouldn't

- Check backend logs for subscription check errors
- Verify agent ID matches (e.g., `founder-coach` vs `Founder Coach Agent`)
- Confirm row exists in `subscriptions` with `is_active = true`

---

**Status**: ✅ Auth & Subscription System Ready  
**Next**: Integrate payment system or admin panel for managing subscriptions
