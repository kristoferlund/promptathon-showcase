# Promptathon Showcase

A decentralized app showcase and gallery built on the Internet Computer with AI-powered metadata extraction, screenshot capture, and search.

## Overview

Promptathon Showcase allows users to browse and search for Internet Computer applications in a gallery format with rich metadata including titles, descriptions, and screenshots. An admin-controlled indexer crawls websites, extracts and enriches metadata using AI, captures screenshots, and stores everything in the canister.

**Features:**
- 🔍 Full-text search on app titles and descriptions
- 🤖 AI-powered metadata enrichment (OpenAI or Anthropic)
- 📸 Dual-resolution screenshots (1500x844 and 200x112) hosted on Cloudflare R2
- 🌐 SSR with Cyber Bunker dark theme
- 🔐 Admin-protected upsert and delete operations
- ⚡ SQLite backend for fast queries

## Quick Start

### Prerequisites

- `dfx` CLI installed
- Node.js/pnpm
- Cloudflare R2 bucket (for image hosting)
- OpenAI or Anthropic API key

### Deploy Canister

```bash
# Set your admin principal
ADMIN=$(dfx identity get-principal)

# Stop any existing dfx instance and start fresh
dfx stop
dfx start --clean --background

# Deploy with admin principal
dfx deploy server --argument "(opt principal \"$ADMIN\")"
```

**⚠️ Important:** You must pass your principal as the admin argument during deployment. Without this, you cannot add or manage apps.

### Index Apps

```bash
cd indexer
npm install
npx playwright install chromium

# Configure environment
cp .env.example .env
# Edit .env with:
# - OPENAI_API_KEY or ANTHROPIC_API_KEY
# - R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
# - R2_BUCKET_NAME, R2_PUBLIC_URL
# - CANISTER_ID (from deploy output)

# Run indexer
npm run dev
```

### Access Search UI

```
http://uxrrr-q7777-77774-qaaaq-cai.raw.localhost:4943/?q=search-term
```

## Managing Apps

### Add/Update Apps

Use the indexer to crawl and index websites. Apps are identified by URL and automatically updated if re-indexed.

```bash
cd indexer
npm run dev  # Process URLs in example.ts
```

### Delete Apps

Use dfx to delete by ID or URL (admin-only):

```bash
# Delete by ID
dfx canister call uxrrr-q7777-77774-qaaaq-cai delete_app_by_id '(7 : int64)'

# Delete by URL
dfx canister call uxrrr-q7777-77774-qaaaq-cai delete_app_by_url '("https://example.com")'
```

## Architecture

**Frontend (SSR):**
- Vite + vanilla HTML templates
- Cyber Bunker theme (dark mode, lime green accents)
- Routes: `/` (search), `/app/:id` (detail)

**Backend (Rust Canister):**
- SQLite database with full-text search
- Admin-protected endpoints: `upsert_app`, `delete_app_by_id`, `delete_app_by_url`
- Query endpoint: `search_apps`

**Indexer (Node.js):**
- Playwright for web scraping and screenshots
- OpenAI/Anthropic for metadata enrichment
- Cloudflare R2 for image storage
- Candid client for canister communication

## Environment Variables (Indexer)

```bash
# AI Provider (choose one)
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=claude-...

# Canister
CANISTER_ID=uxrrr-q7777-77774-qaaaq-cai
NETWORK=local  # or "ic"

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=promptathon-images
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

## Development

```bash
# Build frontend + canister
npm run build

# Deploy
dfx deploy server --argument "(opt principal \"$(dfx identity get-principal)\")"

# Build indexer
cd indexer && npm run build
```

## Troubleshooting

**Indexer fails with "No admin principal configured":**
```bash
# Redeploy with admin principal
ADMIN=$(dfx identity get-principal)
dfx canister uninstall-code server
dfx deploy server --argument "(opt principal \"$ADMIN\")"
```

**Search returning no results:**
- Verify apps were indexed: `dfx canister call uxrrr-q7777-77774-qaaaq-cai search_apps '("")'`
- Check indexer logs for "✓ Upserted" messages

**Screenshots not showing:**
- Verify R2 URL in canister is correct
- Check R2 bucket is publicly accessible
- Test URL: `https://pub-xxxxx.r2.dev/{image_id}_200.jpg`

## Project Structure

```
.
├── src/
│   ├── main.css                # Tailwind + Cyber Bunker theme
│   ├── main.tsx               # Frontend entry
│   ├── routes/                # Frontend routes
│   └── server/                # Rust canister
│       ├── src/
│       │   ├── lib.rs         # Canister init & endpoints
│       │   ├── page/          # Database & business logic
│       │   └── routes/        # HTTP route handlers
│       └── migrations/        # SQLite migrations
├── indexer/                   # Node.js indexer
│   ├── src/
│   │   ├── types.ts          # Type definitions
│   │   ├── extractor.ts      # Playwright + screenshot
│   │   ├── ai.ts             # OpenAI/Anthropic client
│   │   ├── indexer.ts        # Worker pool
│   │   ├── canister.ts       # Candid client
│   │   └── r2.ts             # Cloudflare R2 client
│   └── example.ts            # Example usage
└── router_library/           # Custom routing library
```

## API Reference

### Canister Endpoints

**Query (public):**
```candid
search_apps(query: text) -> result<vec App, text>
```

**Update (admin-only):**
```candid
upsert_app(input: AppInput) -> result<App, text>
delete_app_by_id(id: int64) -> result<(), text>
delete_app_by_url(url: text) -> result<(), text>
```

**Types:**
```candid
type App = record {
  id : int64;
  url : text;
  canister_id : opt text;
  title : text;
  description : text;
  image_id : opt text;
  created_at : int64;
  updated_at : int64;
};

type AppInput = record {
  url : text;
  canister_id : opt text;
  title : text;
  description : text;
  image_id : opt text;
};
```

## Technical Details

- **Database:** SQLite with full-text search on title and description
- **Images:** JPEG at 70% quality, dual resolution (1500x844 and 200x112)
- **Theme:** Tailwind CSS with custom Cyber Bunker palette
- **Rendering:** Server-side HTML templates with minijinja
- **Routing:** File-based static routing compiled at build time

## License

MIT
