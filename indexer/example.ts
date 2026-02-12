import 'dotenv/config';
import { PageIndexer, CanisterClient, R2Uploader } from './src/index.js';
import type { PageSnapshot } from './src/types.js';
import crypto from 'crypto';

// Configuration from environment
const canisterId = process.env.CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai';
const network = (process.env.NETWORK || 'local') as 'local' | 'ic';

// Initialize indexer
const indexer = new PageIndexer({
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  concurrency: 3,
  timeout: 30000,
});

// Initialize R2 uploader (optional)
let r2Uploader: R2Uploader | undefined;
if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
  r2Uploader = new R2Uploader({
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME || 'promptathon-images',
    publicUrl: process.env.R2_PUBLIC_URL,
  });
  console.log('✓ R2 uploader configured');
} else {
  console.log('⚠ R2 not configured - images will not be uploaded');
}

// Initialize canister client
const canister = new CanisterClient({
  canisterId,
  network,
  r2Uploader,
});

// URLs to index
const urls = [
  'https://wishlist-y9z.caffeine.xyz',
  'https://flash-af2.caffeine.xyz/',
  'https://family-chores-4cj.caffeine.xyz/',
  "https://basecamp-f39.caffeine.xyz/",
  "https://punkinup-6o3.caffeine.xyz/",
  "https://fotovid-gpq.caffeine.xyz/",
  "https://chainfile-zfm.caffeine.xyz/",
  "https://chaindrive-cku.caffeine.xyz",
  "https://halo-x09.caffeine.xyz/",
  "https://icforums.xyz/",
  "https://caffeine.top/",
  "https://vibrew.app",
  "https://thebullscorner-pys.caffeine.xyz/"
];


// Emit function - push to canister
async function emit(snapshot: PageSnapshot): Promise<void> {
  if (snapshot.status === 'ok') {
    console.log(`\n📄 ${snapshot.url}`);
    console.log(`   Title: ${snapshot.aiTitle}`);
    console.log(`   Description: ${snapshot.aiDescription.slice(0, 80)}...`);
    console.log(`   Screenshot Large: ${(snapshot.screenshotLarge.length / 1024).toFixed(1)} KB`);
    console.log(`   Screenshot Small: ${(snapshot.screenshotSmall.length / 1024).toFixed(1)} KB`);

    try {
      // Generate a unique ID for this app (hash of URL)
      const appId = crypto.createHash('md5').update(snapshot.url).digest('hex');
      await canister.upsertApp(snapshot, appId);
    } catch (error) {
      console.error(`   Failed to push to canister: ${error}`);
    }
  } else {
    console.error(`\n✗ ${snapshot.url}`);
    console.error(`   Error: ${snapshot.error}`);
  }
}

// Run the indexer
console.log(`🚀 Starting indexer...`);
console.log(`   Canister: ${canisterId}`);
console.log(`   Network: ${network}`);
console.log(`   URLs: ${urls.length}\n`);

indexer
  .processUrls(urls, emit)
  .then(() => console.log('\n✅ Indexing complete!'))
  .catch((err) => console.error('\n❌ Fatal error:', err));
