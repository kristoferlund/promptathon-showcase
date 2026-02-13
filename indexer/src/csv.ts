import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

export type Submission = {
  authorName: string;
  appName: string;
  socialPostUrl: string;
  appUrl: string;
  aiTitle: string;
  aiDescription: string;
};

const HEADER = [
  '*Name*',
  '*Enter the name of your Caffeine app*',
  '*Please link to a social post announcing your app*',
  '*Provide the live link to your app*',
  '*AI Title*',
  '*AI Description*',
];

/**
 * Parse submissions.csv and return validated Submission records.
 * Skips rows with missing/empty app URLs or obvious test/spam entries.
 * Supports optional aiTitle and aiDescription columns (5th and 6th).
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
    const [authorName, appName, socialPostUrl, appUrl, aiTitle, aiDescription] = row.map(
      (s) => s?.trim() ?? ''
    );

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
      aiTitle: aiTitle || '',
      aiDescription: aiDescription || '',
    });
  }

  return submissions;
}

/**
 * Escape a value for CSV output (RFC 4180).
 */
function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/**
 * Serialize submissions back to CSV format.
 */
export function serializeSubmissions(submissions: Submission[]): string {
  const lines = [HEADER.join(',')];
  for (const s of submissions) {
    lines.push(
      [
        csvEscape(s.authorName),
        csvEscape(s.appName),
        csvEscape(s.socialPostUrl),
        csvEscape(s.appUrl),
        csvEscape(s.aiTitle),
        csvEscape(s.aiDescription),
      ].join(',')
    );
  }
  return lines.join('\n') + '\n';
}
