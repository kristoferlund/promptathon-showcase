# Promptathon Showcase Indexer

Build-time tool that reads `submissions.csv`, crawls each app URL, generates AI metadata and screenshots, and outputs a SQL seed file that gets baked into the canister at deploy time.

## Installation

```bash
cd indexer
pnpm install
pnpm exec playwright install chromium
```

## Configuration

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# AI Provider - Choose one:
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# Limit submissions to process (useful during development)
LIMIT=5

# Cloudflare R2 (optional - for screenshot hosting)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=promptathon-images
R2_PUBLIC_URL=https://images.yourdomain.com
```

## Usage

```bash
# Process first 5 submissions (fast, for development)
LIMIT=5 pnpm dev

# Process all submissions
pnpm dev
```

This writes `src/server/src/seeds/seed_apps.sql`. Then deploy the canister:

```bash
# From the project root
dfx deploy server
```

## How It Works

1. **Parse** - Reads submissions from `submissions.csv`
2. **Navigate** - Opens each app URL in headless Chromium
3. **Extract** - Captures title, meta description, visible text
4. **Screenshot** - Takes dual-resolution JPEG screenshots (1500x844 + 200x112)
5. **AI Enrich** - Generates optimized title and description via OpenAI or Anthropic
6. **Upload** - Uploads screenshots to Cloudflare R2 (if configured)
7. **Output** - Writes SQL INSERT statements to `seed_apps.sql`

## Data Flow

```
submissions.csv → Playwright → Screenshots + Text → AI → seed_apps.sql
                                                      → R2 (screenshots)
```

## AI Models

- **OpenAI**: gpt-4o-mini (~$0.15/1M tokens)
- **Anthropic**: claude-3-5-haiku (~$0.80/1M tokens)

Both are fast, cheap, and deterministic (low temperature).
