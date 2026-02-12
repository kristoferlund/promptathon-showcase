import { execSync } from 'child_process';
import { mkdtempSync, writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { PageSnapshot } from './types.js';
import type { R2Uploader } from './r2.js';

export type CanisterConfig = {
  canisterId: string;
  network?: 'local' | 'ic';
  r2Uploader?: R2Uploader;
};

export class CanisterClient {
  private canisterId: string;
  private network: string;
  private r2Uploader?: R2Uploader;

  constructor(config: CanisterConfig) {
    this.canisterId = config.canisterId;
    this.network = config.network === 'ic' ? '--ic' : '';
    this.r2Uploader = config.r2Uploader;
  }

  async upsertApp(snapshot: PageSnapshot, appId?: string): Promise<void> {
    if (snapshot.status !== 'ok') {
      console.log(`Skipping ${snapshot.url} - status: error`);
      return;
    }

    // Extract canister_id from URL if it's an ICP domain
    const canisterId = this.extractCanisterId(snapshot.url);

    // Upload images to R2 if uploader is configured
    let imageId: string | null = null;
    if (this.r2Uploader && appId) {
      try {
        await this.r2Uploader.uploadScreenshots(
          appId,
          snapshot.screenshotLarge,
          snapshot.screenshotSmall
        );
        imageId = appId;  // Store the base ID, frontend will append _1500.jpg or _200.jpg
        console.log(`  ✓ Uploaded screenshots to R2: ${appId}`);
      } catch (error) {
        console.error(`  ✗ Failed to upload screenshots:`, error instanceof Error ? error.message : error);
      }
    }

    // Escape quotes in strings for Candid
    const escapeCandid = (str: string) => {
      return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    };

    const candidArg = `(record { 
      url = "${escapeCandid(snapshot.url)}"; 
      canister_id = ${canisterId ? `opt "${escapeCandid(canisterId)}"` : 'null'}; 
      title = "${escapeCandid(snapshot.aiTitle)}"; 
      description = "${escapeCandid(snapshot.aiDescription)}"; 
      image_id = ${imageId ? `opt "${escapeCandid(imageId)}"` : 'null'} 
    })`;

    // Write argument to temp file to avoid shell escaping issues
    const tempDir = mkdtempSync(join(tmpdir(), 'dfx-'));
    const argFile = join(tempDir, 'arg.txt');
    
    try {
      writeFileSync(argFile, candidArg, 'utf-8');
      
      const cmd = `dfx canister call ${this.network} ${this.canisterId} upsert_app --argument-file "${argFile}"`;
      execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
      console.log(`✓ Upserted: ${snapshot.url}`);
    } catch (error) {
      console.error(`✗ Failed to upsert ${snapshot.url}:`, error instanceof Error ? error.message : error);
      throw error;
    } finally {
      // Clean up temp file
      try {
        unlinkSync(argFile);
      } catch {}
    }
  }

  private extractCanisterId(url: string): string | null {
    // Extract canister ID from URLs like https://canister-id.icp0.io or https://canister-id.ic0.app
    const match = url.match(/https?:\/\/([a-z0-9-]+)\.(icp0\.io|ic0\.app|raw\.ic0\.app)/);
    if (match && match[1] && match[1].includes('-')) {
      return match[1];
    }
    return null;
  }
}
