# AI Game Generator Setup

The game generator supports real LLM integration for smart game generation!

## Supported Providers

### 1. Google Gemini (recommended with Firebase)
Uses `@google/generative-ai` SDK. Works great with Firebase projects.

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your-api-key-here
# Optional: GEMINI_MODEL=gemini-1.5-flash (default) or gemini-1.5-pro
```

**Getting a Gemini API key:**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key" → Create API key
4. Copy the key and add to `.env.local` or Firebase Functions config

**Firebase Cloud Functions:** Set secrets with:
```bash
firebase functions:secrets:set GEMINI_API_KEY
# Paste your key when prompted
```
Then in `functions/src/index.ts` (or your generate-game handler), use `process.env.GEMINI_API_KEY` or `functions.config().gemini?.api_key`.

### 2. OpenAI
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key-here
```

Uses GPT-4 Turbo for high-quality game generation.

### 3. Anthropic Claude
```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

Uses Claude 3.5 Sonnet for game generation.

### 4. Groq (free tier, Llama models)
Uses Llama 3.3 70B for fast, free game generation.

```bash
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your-api-key-here
# Optional: GROQ_MODEL=llama-3.3-70b-versatile (default) or llama-3.1-8b-instant
```

**Getting a Groq API key:**
1. Go to [Groq Console](https://console.groq.com/)
2. Sign up or sign in
3. Go to API Keys → Create API Key
4. Copy the key and add to `.env.local`

**Firebase production (Cloud Functions):** The generate-game API runs in Cloud Functions. You must provide the key via `functions/.env`:
1. Copy `functions/.env.example` to `functions/.env`
2. Add your Groq key: `GROQ_API_KEY=gsk_your-key`
3. Deploy: `firebase deploy --only functions`

Firebase loads `functions/.env` on deploy. (The `.env` file is gitignored — never commit it.)

### 5. Template Fallback (No API Key Required)
If no API key is set, the system automatically falls back to smart template-based generation that matches game types:
- Racing games
- Platformers
- Shooters
- Puzzle games
- Space games
- Survival games
- Creative sandbox games

## How It Works

1. User enters a game description in the AI Generator tab
2. The system calls `/api/generate-game` with the prompt
3. The API route:
   - Checks for API keys
   - Calls the appropriate LLM provider
   - Returns generated Three.js game code
   - Falls back to templates if no API key or on error
4. Generated code is loaded into the Code Editor
5. User can review, edit, and publish the game

## Getting API Keys

### Google Gemini (Firebase-friendly)
1. Go to https://aistudio.google.com/
2. Click "Get API key" → Create API key
3. Add to `.env.local`: `GEMINI_API_KEY=...` and `AI_PROVIDER=gemini`
4. For Firebase Hosting: configure the key in your backend (Next.js API or Cloud Functions)

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

### Anthropic
1. Go to https://console.anthropic.com/
2. Create an API key
3. Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`

### Groq (free)
1. Go to https://console.groq.com/
2. Create an API key
3. Add to `.env.local`: `GROQ_API_KEY=gsk_...` and `AI_PROVIDER=groq`

## Features

- **Smart Code Generation**: Creates complete, working Three.js games
- **Multiple Game Types**: Supports various game genres
- **Error Handling**: Gracefully falls back to templates on errors
- **Code Quality**: Generates production-ready code with proper structure
- **Customization**: Users can edit generated code in the Code Editor

## Example Prompts

- "Create a racing game with cars and a track"
- "Make a platformer game where you jump between platforms"
- "Build a space shooter game with asteroids"
- "Generate a puzzle game with matching blocks"
- "Create a survival game with zombies"

The AI will generate appropriate game code based on your description!


















