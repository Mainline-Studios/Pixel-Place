# AI Game Generator Setup

The game generator now supports real LLM integration for smart game generation!

## Supported Providers

### 1. OpenAI (Recommended)
Set these environment variables:
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key-here
```

Uses GPT-4 Turbo for high-quality game generation.

### 2. Anthropic Claude
Set these environment variables:
```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

Uses Claude 3.5 Sonnet for game generation.

### 3. Template Fallback (No API Key Required)
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

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

### Anthropic
1. Go to https://console.anthropic.com/
2. Create an API key
3. Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`

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


