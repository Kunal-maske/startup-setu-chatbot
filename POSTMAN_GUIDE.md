# How to Test the API with Postman

## Step 1: Download Postman

- Go to: **postman.com**
- Click "Download" → Choose your OS (Windows)
- Install it

## Step 2: Import the Collection

1. Open Postman
2. Click **Import** (top left)
3. Choose **Upload Files**
4. Select: `Startup_Setu_API.postman_collection.json` (from this folder)
5. Click **Import**

## Step 3: Make Sure Backend is Running

- Open terminal/PowerShell in this folder
- Run: `npm run dev`
- You should see: `Startup Setu backend listening on port 3000`

## Step 4: Test the API

In Postman, you'll see 4 requests:

### 1. Health Check

- Click: **Health Check**
- Click: **Send**
- Expected response: `{ "status": "ok" }`
- This just checks if the server is alive

### 2. Test Free Agent (Blueprinting)

- Click: **Chat - Business Blueprinting Agent (Free)**
- Click: **Send**
- Expected response:
  ```json
  {
    "reply": "Your AI response here...",
    "agent": "Business Blueprinting Agent",
    "upgrade_required": false
  }
  ```
- NOTE: This will fail if you don't have `GROQ_API_KEY` in `.env`

### 3. Test Paid Agent (Locked)

- Click: **Chat - Business Support Services Agent (Paid)**
- Click: **Send**
- Expected response:
  ```json
  {
    "reply": "Based on your current stage, you need the Business Support Services Agent...",
    "agent": "Business Support Services Agent",
    "upgrade_required": true
  }
  ```
- This will always show `upgrade_required: true` because the user doesn't have access

### 4. Test Memory Update

- Click: **Chat - Memory Test (Update Startup Info)**
- Click: **Send**
- Expected response: Same as #2
- This tests the auto-save feature for startup info

---

## To Make It Work Fully:

**Add your Groq API Key to `.env`:**

1. Go to: **console.groq.com**
2. Sign up (free)
3. Copy your API key
4. Open `.env` file
5. Replace `your-groq-api-key` with your actual key
6. Save and restart the server (`npm run dev`)

**Groq Free Tier:**

- 100+ requests per day
- Fast responses (< 1 second)
- Perfect for testing

---

## What Each Request Tests:

| Request                | Tests                   | Needs        |
| ---------------------- | ----------------------- | ------------ |
| Health Check           | Server is alive         | Nothing      |
| Blueprinting Agent     | AI chat works           | GROQ_API_KEY |
| Support Services Agent | Unlock feature works    | GROQ_API_KEY |
| Memory Test            | Auto-save feature works | GROQ_API_KEY |

---

## Troubleshooting:

**Q: "Cannot connect to localhost:3000"**

- A: Backend isn't running. Run `npm run dev` in terminal

**Q: "GROQ_API_KEY not set"**

- A: Add it to `.env` file

**Q: "Supabase error"**

- A: Normal if you don't have Supabase set up yet. Memory won't save to DB, but AI still works.

---

## Next Steps:

Once you confirm all 4 requests work → We'll build a simple frontend (HTML page)
