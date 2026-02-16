# Promptathon Showcase Indexer

Build-time tool that reads `submissions.csv`, crawls each app URL, generates AI metadata and screenshots, and outputs a SQL seed file + images that get baked into the canister at deploy time.

Results are cached: AI-generated titles and descriptions are written back to `submissions.csv`, and screenshots are saved to `indexer/images/`. Re-running the indexer skips any submission that already has complete data and images on disk.

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
# OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Limit submissions to process (useful during development)
LIMIT=5

# Network: "local" for local dfx replica, "ic" for mainnet
NETWORK=local
```

## Usage

```bash
# Process first 5 submissions (fast, for development)
LIMIT=5 pnpm dev

# Process all submissions
pnpm dev
```

The indexer produces two outputs:

- `server/src/seeds/seed_apps.sql` - SQL seed file baked into the canister
- `indexer/images/` - Screenshot JPEGs bundled into the canister at deploy time

Then deploy the canister from the project root:

```bash
dfx deploy server
```

The deploy process (`dfx.json`) automatically copies `indexer/images/` into `dist/images/` after the Vite build and before the Rust build, so the images are embedded in the canister WASM via `include_dir!`.

## How It Works

1. **Parse** - Reads submissions from `submissions.csv` (including cached AI data if present)
2. **Skip** - Skips submissions that already have AI title/description in CSV and images on disk
3. **Navigate** - Opens each remaining app URL in headless Chromium
4. **Extract** - Captures title, meta description, visible text
5. **Screenshot** - Takes dual-resolution JPEG screenshots (1500x844 + 300x169)
6. **AI Enrich** - Generates optimized title and description via OpenAI or Anthropic
7. **Save** - Saves screenshots to `indexer/images/` and updates `submissions.csv` after each app
8. **Output** - Writes SQL INSERT statements to `seed_apps.sql`

## Data Flow

```
submissions.csv --> Playwright --> Screenshots + Text --> AI --> submissions.csv (updated)
                                                            --> indexer/images/ (screenshots)
                                                            --> seed_apps.sql
```

## Caching

The indexer is designed to be re-run safely:

- **AI data** is cached in `submissions.csv` (two extra columns: `*AI Title*`, `*AI Description*`). The CSV is updated after each successfully processed app, so progress is preserved even if the process is interrupted.
- **Screenshots** are cached in `indexer/images/`. If both `{id}_1500.jpg` and `{id}_300.jpg` exist, the app is not re-screenshotted.
- A submission is only re-processed if it's missing either AI data or images.

## AI Models

- **OpenAI**: gpt-4o-mini
- **Anthropic**: claude-3-5-haiku

Both are fast, cheap, and deterministic (low temperature).
