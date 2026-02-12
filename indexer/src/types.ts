export type Input = {
  urls: string[];
};

export type SubmissionMeta = {
  authorName: string;
  appName: string;
  socialPostUrl: string;
};

export type PageSnapshot = {
  url: string;

  // Submission metadata (from CSV)
  submission: SubmissionMeta;

  // Raw data
  rawTitle: string;
  metaDescription: string | null;
  extractedText: string;

  // Visual
  screenshotLarge: Buffer;  // 1500x844 JPEG
  screenshotSmall: Buffer;  // 200x112 JPEG

  // AI output
  aiTitle: string;
  aiDescription: string;

  // Runtime metadata
  fetchedAt: string;
  status: "ok" | "error";
  error?: string;
};

export type IndexerConfig = {
  concurrency?: number;
  timeout?: number;
  openaiApiKey?: string;
  anthropicApiKey?: string;
};

export type EmitFn = (snapshot: PageSnapshot) => Promise<void> | void;
