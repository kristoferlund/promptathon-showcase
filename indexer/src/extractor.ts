import { chromium, Browser } from 'playwright';
import sharp from 'sharp';

export type ExtractedData = {
  rawTitle: string;
  metaDescription: string | null;
  extractedText: string;
  screenshotLarge: Buffer;  // 1500x844 JPEG
  screenshotSmall: Buffer;  // 200x112 JPEG
};

const MAX_TEXT_LENGTH = 50000;
const NAVIGATION_TIMEOUT = 30000;

export class BrowserExtractor {
  private browser: Browser | null = null;

  async init(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
  }

  async close(): Promise<void> {
    await this.browser?.close();
    this.browser = null;
  }

  async extract(url: string): Promise<ExtractedData> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    const page = await this.browser.newPage();

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: NAVIGATION_TIMEOUT,
      });

      // Optional: wait for network idle with timeout
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
        // Ignore timeout - proceed anyway
      });

      // Extract raw title
      const rawTitle = await page.title();

      // Extract meta description
      const metaDescription = await page
        .locator('meta[name="description"]')
        .getAttribute('content')
        .catch(() => null);

      // Extract visible text
      const extractedText = (
        await page.evaluate(() => document.body.innerText).catch(() => '')
      ).slice(0, MAX_TEXT_LENGTH);

      // Set viewport for consistent screenshot size (1500x844, 16:9)
      await page.setViewportSize({ width: 1500, height: 844 });

      // Capture large screenshot (1500x844, 16:9)
      const screenshotLarge = await page.screenshot({ 
        type: 'jpeg', 
        quality: 70 
      });

      // Resize to create small thumbnail (200x112, 16:9)
      const screenshotSmall = await sharp(screenshotLarge)
        .resize(200, 112, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toBuffer();

      return {
        rawTitle,
        metaDescription,
        extractedText,
        screenshotLarge,
        screenshotSmall,
      };
    } finally {
      await page.close();
    }
  }
}
