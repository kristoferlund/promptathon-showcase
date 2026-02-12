import PQueue from 'p-queue';
import { BrowserExtractor } from './extractor.js';
import { AIEnricher } from './ai.js';
import type { PageSnapshot, IndexerConfig, EmitFn } from './types.js';

export class PageIndexer {
  private config: IndexerConfig & { concurrency: number; timeout: number };
  private extractor: BrowserExtractor;
  private enricher: AIEnricher;

  constructor(config: IndexerConfig) {
    this.config = {
      ...config,
      concurrency: config.concurrency ?? 3,
      timeout: config.timeout ?? 30000,
    };
    this.extractor = new BrowserExtractor();
    this.enricher = new AIEnricher({
      openaiKey: config.openaiApiKey,
      anthropicKey: config.anthropicApiKey,
    });
  }

  async processUrls(urls: string[], emit: EmitFn): Promise<void> {
    await this.extractor.init();

    const queue = new PQueue({ concurrency: this.config.concurrency });

    const tasks = urls.map((url) =>
      queue.add(async () => {
        const snapshot = await this.processUrl(url);
        await emit(snapshot);
      })
    );

    await Promise.all(tasks);

    await this.extractor.close();
  }

  private async processUrl(url: string): Promise<PageSnapshot> {
    try {
      const extracted = await this.extractor.extract(url);

      const aiResult = await this.enricher.enrich({
        url,
        rawTitle: extracted.rawTitle,
        metaDescription: extracted.metaDescription,
        extractedText: extracted.extractedText,
      });

      return {
        url,
        rawTitle: extracted.rawTitle,
        metaDescription: extracted.metaDescription,
        extractedText: extracted.extractedText,
        screenshotLarge: extracted.screenshotLarge,
        screenshotSmall: extracted.screenshotSmall,
        aiTitle: aiResult.title,
        aiDescription: aiResult.description,
        fetchedAt: new Date().toISOString(),
        status: 'ok',
      };
    } catch (error) {
      return {
        url,
        rawTitle: '',
        metaDescription: null,
        extractedText: '',
        screenshotLarge: Buffer.alloc(0),
        screenshotSmall: Buffer.alloc(0),
        aiTitle: '',
        aiDescription: '',
        fetchedAt: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
