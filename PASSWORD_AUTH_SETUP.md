# 🚀 Password Authentication & Chat Persistence Setup

## What's New
This update adds two major features to Startup Setu:

1. **Password-Based Authentication** - Users can now create accounts with email + password
2. **Chat Persistence** - Chat history is now saved to the database and persists across sessions

## Prerequisites
- ✅ Node.js v22.x installed
- ✅ Supabase project with database access
- ✅ Backend server running on `localhost:3000`

## Setup Steps

### Step 1: Database Migration (CRITICAL)
You **must** add the `password_hash` column to the `users` table before testing password login.

**Option A: Using Supabase Dashboard**
1. Go to https://supabase.com
2. Open your Startup Setu project
3. Click **SQL Editor** in the left sidebar
4. Click **+ New Query**
5. Copy and paste the SQL from `migrations/001_add_password_hash.sql`
6. Click **Run**

**Option B: Using Supabase CLI**
```bash
supabase db push
```

**Expected Result:**
Table `users` now has a new `password_hash TEXT` column.

### Step 2: Install Dependencies
```bash
npm install
```

This installs `bcryptjs` (v2.4.3) which was added to `package.json` for password hashing.

### Step 3: Start the Development Server
```bash
npm run dev
```

You should see:
```
Startup Setu backend listening on port 3000
```

### Step 4: Test in Browser
Open http://localhost:3000 in your browser.

## Testing Password Login

### Test Scenario 1: New User Signup
1. On the login page, click **"Don't have an account? Sign Up"** button
2. The form should change to signup mode:
   - Title: "Create Account"
   - Subtitle: "Set up your password to get started"
   - Button: "Sign Up"
3. Enter an email (e.g., `testuser@example.com`)
4. Enter a password (minimum 6 characters, e.g., `password123`)
5. Click **Sign Up**
6. **Expected Result:**
   - Success message in console: "Authentication successful"
   - App loads with Business Blueprinting agent accessible
   - Other agents show as 🔒 Locked

### Test Scenario 2: Existing User Login
1. Click **"Already have an account? Sign In"** to switch back to login mode
2. Enter the same email and password from Test Scenario 1
3. Click **Sign In**
4. **Expected Result:**
   - App loads with same subscription status as signup
   - Chat history is loaded from database (if any)

### Test Scenario 3: Invalid Login
1. Try logging in with wrong password
2. **Expected Result:**
   - Error message: "Email or password is incorrect"
   - You remain on login screen

### Test Scenario 4: Chat Persistence
1. Sign up with a new account (email + password)
2. Select **Business Blueprinting** agent
3. Send a message: "What is a business model?"
4. Wait for AI response
5. **Expected Result:**
   - Message appears in chat
   - Server saves to `chat_history` table
   - Message also saved to localStorage (backup)
6. Logout (refresh page and clear browser storage if needed)
7. Login again with the same email + password
8. Select **Business Blueprinting** agent
9. **Expected Result:**
   - Previous chat message appears (loaded from database)

## API Endpoints (New/Updated)

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "isSignup": false
}
```

**Response (Success):**
```json
{
  "userId": "user_abc123",
  "email": "user@example.com",
  "subscriptions": {
    "business-blueprinting": true,
    "founder-coach": false,
    "legal": false,
    ...
  }
}
```

**Response (Error):**
```json
{
  "error": "Email or password is incorrect"
}
```

### GET /api/chat-history (NEW)
**Query Parameters:**
- `user_id` - User ID from login
- `agent_id` - Agent ID (e.g., "business-blueprinting")

**Response:**
```json
{
  "history": [
    {
      "message": "What is a business model?",
      "reply": "A business model describes...",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Database Changes

### users Table
New column added:
- `password_hash TEXT` - Bcrypt-hashed password (NULL by default for existing users)

### chat_history Table (Already Existed)
Used to store persistent chat messages:
- `user_id` - User who sent message
- `agent_name` - Which agent was used
- `user_message` - User's input
- `ai_reply` - AI response
- `created_at` - Timestamp

## Troubleshooting

### Issue: "Please enter your password" error
**Cause:** Password field is empty  
**Fix:** Enter a password with at least 6 characters

### Issue: "Email or password is incorrect"
**Cause:** User doesn't exist or password is wrong  
**Fix:** 
- For new users: Click "Sign Up" and create account first
- Check that you applied the database migration

### Issue: Chat history not loading
**Cause:** Messages not being saved to database  
**Fix:**
- Check that backend is running (`npm run dev`)
- Check Supabase credentials in `.env` file
- Check that `chat_history` table exists

### Issue: "400 Bad Request" on login
**Cause:** Missing password_hash column in database  
**Fix:** Apply the database migration (Step 1 above)

## Security Notes

⚠️ **For Production:**
- Add rate limiting to `/api/auth/login` endpoint
- Use HTTPS only
- Implement JWT tokens for session management
- Add password strength validation
- Implement account lockout after failed login attempts
- Add password reset functionality

## File Changes Summary

**Backend:**
- `src/routes/auth.js` - Added password handling with bcryptjs
- `src/routes/chat.js` - Added GET /api/chat-history endpoint

**Frontend:**
- `index.html` - Added password input, signup/login toggle, chat persistence from DB

**Dependencies:**
- Added `bcryptjs@^2.4.3` to package.json

**Migrations:**
- `migrations/001_add_password_hash.sql` - Database schema update

## Next Steps

1. ✅ Apply database migration (Step 1)
2. ✅ Run `npm install` (Step 2)
3. ✅ Start server `npm run dev` (Step 3)
4. ✅ Test scenarios in browser (Step 4)
5. (Optional) Upgrade agents - Add payment gateway for premium agents
6. (Optional) Add password reset - Email verification flow
7. (Optional) Session management - JWT tokens instead of client-side storage

## Support

For issues or questions:
1. Check browser console for error messages
2. Check terminal output for backend errors
3. Verify `.env` file has correct Supabase credentials
4. Ensure database migration was applied successfully
