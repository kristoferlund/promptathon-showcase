import PQueue from 'p-queue';
import { BrowserExtractor } from './extractor.js';
import { AIEnricher } from './ai.js';
import type { PageSnapshot, IndexerConfig, EmitFn, SubmissionMeta } from './types.js';

export type SubmissionInput = {
  url: string;
  meta: SubmissionMeta;
};

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

  /**
   * @deprecated Use processSubmissions instead
   */
  async processUrls(urls: string[], emit: EmitFn): Promise<void> {
    const submissions = urls.map((url) => ({
      url,
      meta: { authorName: 'Unknown', appName: 'Untitled', socialPostUrl: '' },
    }));
    await this.processSubmissions(submissions, emit);
  }

  async processSubmissions(submissions: SubmissionInput[], emit: EmitFn): Promise<void> {
    await this.extractor.init();

    const queue = new PQueue({ concurrency: this.config.concurrency });

    const tasks = submissions.map((submission) =>
      queue.add(async () => {
        const snapshot = await this.processSubmission(submission);
        await emit(snapshot);
      })
    );

    await Promise.all(tasks);

    await this.extractor.close();
  }

  private async processSubmission(submission: SubmissionInput): Promise<PageSnapshot> {
    try {
      const extracted = await this.extractor.extract(submission.url);

      const aiResult = await this.enricher.enrich({
        url: submission.url,
        rawTitle: extracted.rawTitle,
        metaDescription: extracted.metaDescription,
        extractedText: extracted.extractedText,
      });

      return {
        url: submission.url,
        submission: submission.meta,
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
        url: submission.url,
        submission: submission.meta,
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
