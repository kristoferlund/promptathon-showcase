import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

export type Submission = {
  authorName: string;
  appName: string;
  socialPostUrl: string;
  appUrl: string;
};

/**
 * Parse submissions.csv and return validated Submission records.
 * Skips rows with missing/empty app URLs or obvious test/spam entries.
 */
export function loadSubmissions(csvPath: string): Submission[] {
  const raw = readFileSync(csvPath, 'utf-8');

  const records: string[][] = parse(raw, {
    skip_empty_lines: true,
    relax_column_count: true,
  });

  // Skip header row
  const dataRows = records.slice(1);

  const submissions: Submission[] = [];
  const seenUrls = new Set<string>();

  for (const row of dataRows) {
    const [authorName, appName, socialPostUrl, appUrl] = row.map((s) => s?.trim() ?? '');

    // Skip rows with no app URL
    if (!appUrl) continue;

    // Skip rows where the app URL is clearly not a valid web app
    if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) continue;

    // Strip fragment identifiers (e.g. #caffeineAdminToken=...)
    const cleanUrl = appUrl.split('#')[0];

    // Deduplicate by cleaned URL
    if (seenUrls.has(cleanUrl)) continue;
    seenUrls.add(cleanUrl);

    submissions.push({
      authorName: authorName || 'Unknown',
      appName: appName || 'Untitled',
      socialPostUrl: socialPostUrl || '',
      appUrl: cleanUrl,
    });
  }

  return submissions;
}
