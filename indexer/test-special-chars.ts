import 'dotenv/config';
import { CanisterClient } from './src/index.js';
import type { PageSnapshot } from './src/types.js';

const canisterId = process.env.CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai';
const network = (process.env.NETWORK || 'local') as 'local' | 'ic';

const canister = new CanisterClient({ canisterId, network });

// Test snapshot with problematic characters
const testSnapshot: PageSnapshot = {
  url: 'https://example.com/page?q="test"&foo=\'bar\'',
  status: 'ok',
  rawTitle: 'Raw Title',
  metaDescription: null,
  extractedText: 'Extracted text content',
  aiTitle: 'Test "Quoted" Title with \'apostrophes\'',
  aiDescription: 'Description with "double quotes", \'single quotes\', and special chars: <>&',
  screenshotPngBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  fetchedAt: new Date().toISOString(),
};

console.log('Testing canister client with special characters...');
console.log('URL:', testSnapshot.url);
console.log('Title:', testSnapshot.aiTitle);

canister.upsertApp(testSnapshot)
  .then(() => console.log('✓ Test passed - special characters handled correctly'))
  .catch((err) => {
    console.error('✗ Test failed:', err);
    process.exit(1);
  });
