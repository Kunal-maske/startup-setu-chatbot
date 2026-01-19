# Startup Setu - AI-Powered Multi-Agent Chatbot

A production-ready Node.js + Express web app for startup founders. Features password-based authentication, 11 specialized AI agents, persistent chat history, and a PWA-ready frontend.

## 🚀 Features

✅ **Password-Based Authentication** — Secure email + password signup/login  
✅ **11 AI Agents** — Each specialized for different startup challenges  
✅ **Free Agent** — Business Blueprinting Agent free for all users  
✅ **Premium Agents** — 10 paid agents with subscription support  
✅ **Chat Persistence** — Messages saved to Supabase (survives logout)  
✅ **Startup Memory** — Extracts and remembers key startup info  
✅ **PWA Ready** — Install on mobile/desktop like a native app  
✅ **Responsive UI** — Works on mobile, tablet, desktop  

## 🛠 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML/CSS (PWA-ready)
- **Backend**: Node.js v22 + Express.js v4
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq API with llama-3.1-8b-instant
- **Authentication**: Password-based with bcryptjs hashing
- **Deployment**: Ready for Vercel, Railway, Heroku

## 📋 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier available)
- Groq API key (free at https://console.groq.com)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd startup-setu-chatbot
npm install
```

### 2. Configure Environment

Create `.env` file in root directory:

```dotenv
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant
```

### 3. Setup Database (REQUIRED!)

**IMPORTANT:** Before running password login, you must add the `password_hash` column to your database.

1. Go to https://supabase.com and open your Startup Setu project
2. Click **SQL Editor** in the left sidebar
3. Click **+ New Query**
4. Copy the SQL from `migrations/001_add_password_hash.sql`
5. Paste and click **Run**
6. Also run setup from [DATABASE_SETUP.md](./DATABASE_SETUP.md)

See [PASSWORD_AUTH_SETUP.md](./PASSWORD_AUTH_SETUP.md) for detailed instructions.

### 4. Start Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## 👥 Usage

### First Time (Sign Up)
1. Click "Don't have an account? Sign Up"
2. Enter email and password (minimum 6 characters)
3. Click **Sign Up**
4. Chat interface loads with Business Blueprinting agent

### Returning Users (Sign In)
1. Enter email and password
2. Click **Sign In**
3. All previous chats are restored from database
4. Select any agent to continue chatting

### Selecting Agents
- **Business Blueprinting** → Always FREE (green)
- **Other 10 agents** → LOCKED (🔒) until subscribed (red)

## 🤖 AI Agents

| Agent | Type | Purpose |
|-------|------|---------|
| Business Blueprinting | **FREE** | Business model, strategy, roadmap |
| Founder Coach | Premium | Mentorship, decision making |
| Market Researcher | Premium | Market analysis, competitors |
| Financial Planner | Premium | Revenue, burn rate, funding |
| Product Strategist | Premium | Product roadmap, features |
| Legal Advisor | Premium | Contracts, legal compliance |
| Tech Advisor | Premium | Technology stack decisions |
| Investor Relations | Premium | Pitch deck, investor outreach |
| Operations Manager | Premium | Processes, scaling, efficiency |
| HR Consultant | Premium | Team building, hiring |
| Customer Success | Premium | Customer retention, support |

## 📁 Project Structure

```
startup-setu-chatbot/
├── src/
│   ├── server.js                  # Express server entry point
│   ├── routes/
│   │   ├── auth.js               # Login/signup endpoint (password-based)
│   │   └── chat.js               # Chat + chat history endpoints
│   ├── clients/
│   │   ├── supabaseClient.js     # Database connection
│   │   └── groqClient.js         # AI API integration
│   ├── agents/
│   │   └── prompts.js            # 11 agent system prompts
│   └── utils/
│       ├── validate.js           # Request validation
│       └── memoryExtractor.js    # Extract startup memory
│
├── migrations/
│   ├── 001_add_password_hash.sql # Database schema migration
│   └── README.md                 # Migration instructions
│
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── service-worker.js         # Offline support
│   └── icons/                    # App icons
│
├── index.html                    # Frontend (single-page app)
├── package.json                  # Dependencies
├── .env.example                  # Environment template
├── .env                          # Your secrets (gitignored)
├── .gitignore                    # Git ignore rules
│
└── Documentation:
    ├── README.md                 # This file
    ├── PASSWORD_AUTH_SETUP.md    # Password auth + chat persistence
    ├── DATABASE_SETUP.md         # Database schema setup
    ├── AUTHENTICATION.md         # Auth system docs
    ├── PWA_GUIDE.md             # PWA installation
    └── .env.example             # Environment variables example
```

## 🔑 API Endpoints

### Authentication

**POST /api/auth/login**
- Sign up new user or sign in existing user
- Request:
  ```json
  {
    "email": "founder@example.com",
    "password": "securePassword123",
    "isSignup": false
  }
  ```
- Response:
  ```json
  {
    "userId": "user_abc123",
    "email": "founder@example.com",
    "subscriptions": {
      "business-blueprinting": true,
      "founder-coach": false,
      ...
    }
  }
  ```

### Chat

**POST /api/chat**
- Send message to agent
- Request:
  ```json
  {
    "user_id": "user_abc123",
    "session_id": "session_123",
    "message": "Help me create a business model",
    "preferred_agent": "business-blueprinting"
  }
  ```
- Response:
  ```json
  {
    "reply": "A business model describes how your company...",
    "agent": "Business Blueprinting Agent",
    "upgrade_required": false
  }
  ```

**GET /api/chat-history**
- Fetch previous chat messages (with pagination)
- Query params: `user_id`, `agent_id`
- Response:
  ```json
  {
    "history": [
      {
        "message": "How do I validate my idea?",
        "reply": "Start with customer interviews...",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
  ```

**GET /health**
- Server health check
- Response: `{ "status": "ok" }`

## 🔐 Security Features

- **Passwords**: Bcrypt hashing (10 rounds)
- **Service Role**: Database operations use service role key (not exposed to frontend)
- **Subscription Checks**: Backend verifies agent access before responding
- **Rate Limiting**: Ready to add (not yet implemented)
- **Session Management**: Client-side with localStorage (consider JWT for production)

## 📱 Progressive Web App (PWA)

Install on mobile/desktop like a native app:

1. Open app in browser
2. Click "Install" (Chrome) or "Add to Home Screen" (iOS/Android)
3. Works offline (limited functionality)
4. Sync when online

See [PWA_GUIDE.md](./PWA_GUIDE.md) for details.

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
# Follow prompts, set env vars in dashboard
```

### Railway
```bash
npm install -g @railway/cli
railway login
railway up
```

### Heroku
```bash
heroku create your-app-name
git push heroku main
# Set env vars: heroku config:set KEY=VALUE
```

## 🐛 Troubleshooting

### Issue: "Cannot GET /"
**Solution**: 
- Ensure `npm run dev` is running
- Check PORT in `.env`
- Try `http://localhost:3000`

### Issue: "Email or password is incorrect"
**Solutions**:
- For new users: Click "Sign Up" first
- Verify database migration was applied (Step 3 above)
- Check password_hash column exists in users table

### Issue: Agents showing as locked
**Solutions**:
- Verify Supabase connection in `.env`
- Check subscriptions table in Supabase SQL Editor
- Confirm user has subscription entry for free agent

### Issue: Chat not saving
**Solutions**:
- Ensure backend is running (`npm run dev`)
- Check Groq API key in `.env`
- Verify `chat_history` table exists in Supabase
- Check browser console (F12) for errors

### Issue: NPM modules not installing
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- [PASSWORD_AUTH_SETUP.md](./PASSWORD_AUTH_SETUP.md) — Complete password + persistence setup
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) — Database schema and SQL setup
- [AUTHENTICATION.md](./AUTHENTICATION.md) — Authentication flow details
- [PWA_GUIDE.md](./PWA_GUIDE.md) — Progressive Web App setup

## 🔗 External Resources

- [Groq API Docs](https://console.groq.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com)
- [Node.js Docs](https://nodejs.org/docs)

## 📝 Environment Variables

See `.env.example`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | Yes | Server port (default: 3000) |
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `GROQ_API_KEY` | Yes | Your Groq API key |
| `GROQ_MODEL` | Yes | Model ID (default: llama-3.1-8b-instant) |

## 🎯 Next Steps (Production Ready)

- [ ] Add rate limiting to `/api/auth/login`
- [ ] Implement JWT tokens for session management
- [ ] Add password reset via email
- [ ] Implement payment gateway for premium agents
- [ ] Add analytics/logging
- [ ] Set up error monitoring (Sentry)
- [ ] Add email verification for signup
- [ ] Implement password strength requirements

## 📄 License

MIT - Use freely for personal or commercial projects

## 🙋 Support

- 📝 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Questions: [GitHub Discussions](https://github.com/your-repo/discussions)

---

Built with ❤️ for startup founders. Ready to launch? 🚀

**Start here:**
```bash
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

Then visit `http://localhost:3000`
