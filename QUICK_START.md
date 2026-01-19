# 🚀 Quick Start - Password Login & Chat Persistence

## What's New? 
✨ Password-based login (no more email-only!) + chats persist forever

## Before You Start
1. **Apply database migration** → See [PASSWORD_AUTH_SETUP.md](./PASSWORD_AUTH_SETUP.md) Step 1
2. **Run `npm install`** → Gets bcryptjs for password hashing
3. **Start server** → `npm run dev`

## Try It Out

### Sign Up (New User)
```
1. Open http://localhost:3000
2. Click "Don't have an account? Sign Up"
3. Enter email: yourname@example.com
4. Enter password: mypassword123 (min 6 chars)
5. Click "Sign Up"
→ You're in! Free agent ready to chat
```

### Sign In (Returning User)
```
1. Open http://localhost:3000
2. Form shows "Sign In" by default
3. Enter email: yourname@example.com
4. Enter password: mypassword123
5. Click "Sign In"
→ Your previous chats appear automatically!
```

### Send a Message
```
1. Select "Business Blueprinting" agent
2. Type: "How do I create a business model?"
3. Hit Enter
→ AI responds + message saved to database
```

### Try Another Device
```
1. On a different device (phone/tablet/PC)
2. Go to http://localhost:3000 (or your deployed URL)
3. Sign in with same email + password
4. Select same agent
→ All your chats appear!
```

## Key Features

| Feature | Before | Now |
|---------|--------|-----|
| Login | Email only | Email + Password |
| Signup | Auto-created | Create account with password |
| Chats | Disappeared on logout | Persist forever |
| Multiple Devices | Lost on new device | Accessible from anywhere |
| Password Security | N/A | Bcrypt hashing |

## Troubleshooting

**"Please enter your password"**
→ Enter a password with 6+ characters

**"Email or password is incorrect"**
→ Wrong credentials. Try again or sign up first.

**Chat not appearing after login**
→ Check console (F12), ensure backend is running

**Can't sign up**
→ Apply database migration first (Step 1 above)

## API (For Developers)

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "isSignup": true
  }'

# Sign in
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "isSignup": false
  }'

# Get chat history
curl "http://localhost:3000/api/chat-history?user_id=USER_ID&agent_id=business-blueprinting"
```

## Files to Know

- **Password logic** → `src/routes/auth.js`
- **Chat persistence** → `src/routes/chat.js` + `index.html`
- **Database schema** → `migrations/001_add_password_hash.sql`
- **Frontend form** → `index.html` (search for "loginForm")

## What Happens Behind the Scenes?

1. **Signup**
   - Password hashed with bcryptjs (10 rounds)
   - Stored in database as password_hash
   - Free agent subscription granted

2. **Login**
   - Password compared against stored hash
   - Subscriptions loaded from database
   - Chat history fetched from chat_history table

3. **Chat Message**
   - Sent to Groq AI
   - Response saved to database
   - Message displayed in UI

## Next Steps

- [ ] Test password signup/login
- [ ] Check chat persists across logout/login
- [ ] Try from different device
- [ ] (Optional) Deploy to Vercel/Railway/Heroku

## Need Help?

- **Setup questions** → See [PASSWORD_AUTH_SETUP.md](./PASSWORD_AUTH_SETUP.md)
- **Database issues** → See [migrations/README.md](./migrations/README.md)
- **Full docs** → See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

**That's it!** You now have a secure, persistent chatbot. 🎉
