# Promptathon Showcase Indexer

URL snapshot and metadata pipeline that indexes web applications into the Promptathon Showcase canister.

## Features

- Headless browser rendering with Playwright
- Full-page screenshot capture
- Content extraction (title, meta, text)
- AI-powered title and description generation (OpenAI or Anthropic)
- Concurrent processing with worker pool
- Automatic push to search canister via dfx CLI

## Installation

```bash
cd indexer
npm install
npx playwright install chromium
```

## Configuration

Create a `.env` file:

```bash
# AI Provider - Choose one:
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# Canister Configuration
CANISTER_ID=uxrrr-q7777-77774-qaaaq-cai
NETWORK=local  # or "ic" for mainnet
```

## Usage

```bash
npm run dev
```

Or programmatically:

```typescript
import { PageIndexer, CanisterClient } from './src/index.js';

const indexer = new PageIndexer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  concurrency: 3,
});

const canister = new CanisterClient({
  canisterId: 'your-canister-id',
  network: 'local',
});

await indexer.processUrls(urls, async (snapshot) => {
  await canister.upsertApp(snapshot);
});
```

## How It Works

1. **Navigate** - Opens URL in headless Chromium
2. **Extract** - Captures title, meta description, visible text
3. **Screenshot** - Takes full-page PNG screenshot
4. **AI Enrich** - Generates optimized title & description
5. **Push** - Calls `dfx canister call upsert_app` to store in canister

## Data Flow

```
URL → Playwright → Screenshot + Text → AI → Canister
```

Each URL produces:
```typescript
{
  url: "https://example.com",
  canister_id: "abc-123" | null,  // Auto-extracted from ICP URLs
  aiTitle: "AI-generated title",
  aiDescription: "AI-generated description",
  screenshotPngBase64: "...",
  status: "ok" | "error"
}
```

## Admin Access

The canister must be deployed with an admin principal:

```bash
dfx deploy server --argument "(opt principal \"$(dfx identity get-principal)\")"
```

Only the admin can call `upsert_app`.

## Models

- **OpenAI**: gpt-4o-mini (~$0.15/1M tokens)
- **Anthropic**: claude-3-5-haiku (~$0.80/1M tokens)

Both are fast, cheap, and deterministic (low temperature).
