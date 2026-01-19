# Startup Setu - AI-Powered Multi-Agent Chatbot

A production-ready Node.js + React web app for startup founders. Features email login, 11 specialized AI agents, persistent chat history, and a PWA-ready frontend.

## Features

✅ **Email Authentication** — Simple email login, no passwords needed  
✅ **11 AI Agents** — Each specialized for different startup challenges  
✅ **Free Agent** — Business Blueprinting Agent free for all users  
✅ **Premium Agents** — 10 paid agents with subscription support  
✅ **Chat Persistence** — Messages saved to Supabase  
✅ **Startup Memory** — Extracts and remembers key startup info  
✅ **PWA Ready** — Install on mobile/desktop like a native app  
✅ **Responsive UI** — Works on mobile, tablet, desktop  

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML/CSS (PWA-ready)
- **Backend**: Node.js + Express.js
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq API (OpenAI-compatible)
- **Auth**: Email-based
- **Deployment**: Ready for Vercel, Railway, Heroku

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier)
- Groq API key (free)

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd startup-setu-chatbot
npm install
```

### 2. Configure Environment

Create `.env` file:

```dotenv
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant
```

### 3. Setup Database

Run SQL in Supabase (see [DATABASE_SETUP.md](./DATABASE_SETUP.md)):

```bash
# Copy contents of DATABASE_SETUP.md and SUBSCRIPTION_SETUP.sql
# Paste into Supabase SQL Editor and run
```

### 4. Start Development

```bash
npm run dev
```

Open `http://localhost:3000`

## Usage

1. **Login** → Enter email
2. **Select Agent** → Click to chat
3. **Free Agent** → Business Blueprinting (always free)
4. **Premium Agents** → Locked until subscribed

## Agents

| Agent | Type |
|-------|------|
| Business Blueprinting | **FREE** |
| Founder Coach | Premium |
| Market Researcher | Premium |
| Financial Planner | Premium |
| Product Strategist | Premium |
| Legal Advisor | Premium |
| Tech Advisor | Premium |
| Investor Relations | Premium |
| Operations Manager | Premium |
| HR Consultant | Premium |
| Customer Success | Premium |

## Project Structure

```
src/
├── server.js              # Express server
├── routes/
│   ├── auth.js           # Login endpoint
│   └── chat.js           # Chat endpoint
├── clients/
│   ├── supabaseClient.js # DB connection
│   └── groqClient.js     # AI API
├── agents/
│   └── prompts.js        # Agent prompts
└── utils/
    ├── validate.js
    └── memoryExtractor.js

index.html               # Frontend (PWA)
manifest.json            # PWA config
service-worker.js        # Offline support
```

## API Endpoints

### POST /api/auth/login
```json
{ "email": "user@example.com" }
```

### POST /api/chat
```json
{
  "user_id": "user-uuid",
  "message": "Help me validate my idea",
  "preferred_agent": "business-blueprinting"
}
```

## Documentation

- [AUTHENTICATION.md](./AUTHENTICATION.md) — Auth system docs
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) — Database schema
- [PWA_GUIDE.md](./PWA_GUIDE.md) — PWA installation
- [Groq Docs](https://console.groq.com/docs)
- [Supabase Docs](https://supabase.com/docs)

## Deployment

### Vercel
```bash
vercel login
vercel
```

### Railway
```bash
railway login
railway up
```

### Heroku
```bash
heroku create app-name
git push heroku main
```

## Troubleshooting

### "Cannot GET /"
- Run: `npm run dev`
- Check PORT in `.env`

### Agents showing as locked
- Check Supabase connection
- Verify `.env` has correct credentials
- Check if tables exist in Supabase

### Chat not working
- Verify Groq API key in `.env`
- Check browser console (F12)
- Ensure backend is running

## License

MIT - Use freely for personal or commercial projects

## Support

- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

Built with ❤️ for startup founders. Ready to launch? 🚀

Run:

```bash
cp .env.example .env
# fill in .env
npm install
npm run dev
```

API:
- `GET /health` — returns { status: "ok" }
- `POST /api/chat` — main chat endpoint (JSON)
