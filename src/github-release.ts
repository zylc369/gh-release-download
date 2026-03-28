/**
 * GitHub Release Downloader
 */

import { Octokit } from '@octokit/rest';
import { minimatch } from 'minimatch';
import { request } from 'undici';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import {
  GitHubReleaseDownloaderConfig,
  ReleaseInfo,
  ReleaseAsset,
  DownloadResult,
  MatchedAsset,
  ParsedRepoUrl,
} from './types.js';
import { parseRepoUrl, ensureDir, formatBytes } from './utils.js';

export class GitHubReleaseDownloader {
  private octokit: Octokit;
  private config: GitHubReleaseDownloaderConfig;

  constructor(config: GitHubReleaseDownloaderConfig = {}) {
    this.config = {
      baseUrl: 'https://api.github.com',
      userAgent: 'github-release-download',
      ...config,
    };

    this.octokit = new Octokit({
      auth: config.token,
      baseUrl: this.config.baseUrl,
      userAgent: this.config.userAgent,
    });
  }

  /**
   * Get release information for a specific version or latest
   */
  async getRelease(
    owner: string,
    repo: string,
    version?: string
  ): Promise<ReleaseInfo> {
    try {
      const response = version
        ? await this.octokit.rest.repos.getReleaseByTag({
            owner,
            repo,
            tag: version,
          })
        : await this.octokit.rest.repos.getLatestRelease({
            owner,
            repo,
          });

      return this.mapReleaseInfo(response.data);
    } catch (error) {
      if ((error as any).status === 404) {
        throw new Error(
          version
            ? `Release with tag '${version}' not found in ${owner}/${repo}`
            : `No releases found for ${owner}/${repo}`
        );
      }
      throw error;
    }
  }

  /**
   * Match assets against glob patterns
   */
  matchAssets(
    assets: ReleaseAsset[],
    patterns: string | string[]
  ): MatchedAsset[] {
    const patternArray = Array.isArray(patterns) ? patterns : [patterns];
    const matched: MatchedAsset[] = [];

    for (const asset of assets) {
      for (const pattern of patternArray) {
        if (minimatch(asset.name, pattern, { nocase: true })) {
          matched.push({ asset, matchedPattern: pattern });
          break;
        }
      }
    }

    return matched;
  }

  /**
   * Download a single asset
   */
  async downloadAsset(
    asset: ReleaseAsset,
    outputDir: string,
    token?: string
  ): Promise<DownloadResult> {
    await ensureDir(outputDir);

    const localPath = `${outputDir}/${asset.name}`;
    const headers: Record<string, string> = {
      'user-agent': this.config.userAgent || 'github-release-download',
    };

    if (token) {
      headers['authorization'] = `token ${token}`;
    }

    const response = await request(asset.browserDownloadUrl, {
      method: 'GET',
      headers,
      maxRedirections: 5,
      bodyTimeout: 300000,
      headersTimeout: 30000,
    });

    if (response.statusCode !== 200) {
      throw new Error(
        `Failed to download ${asset.name}: HTTP ${response.statusCode}`
      );
    }

    const fileStream = createWriteStream(localPath);
    await pipeline(response.body, fileStream);

    return {
      asset,
      localPath,
      size: asset.size,
    };
  }

  /**
   * Main download function
   */
  async download(
    repoUrl: string,
    patterns: string | string[],
    options: {
      outputDir: string;
      version?: string;
      token?: string;
      onProgress?: (message: string) => void;
    }
  ): Promise<DownloadResult[]> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const onProgress = options.onProgress || console.log;

    onProgress(`Fetching release from ${owner}/${repo}...`);
    const release = await this.getRelease(owner, repo, options.version);
    
    onProgress(
      `Found release: ${release.tagName}${release.name ? ` - ${release.name}` : ''}`
    );
    onProgress(`Total assets: ${release.assets.length}`);

    onProgress(`Matching assets against patterns...`);
    const matched = await this.matchAssets(release.assets, patterns);
    
    if (matched.length === 0) {
      throw new Error(
        `No assets matched the patterns: ${
          Array.isArray(patterns) ? patterns.join(', ') : patterns
        }`
      );
    }

    onProgress(`Matched ${matched.length} asset(s):`);
    matched.forEach(({ asset }) => {
      onProgress(`  - ${asset.name} (${formatBytes(asset.size)})`);
    });

    const results: DownloadResult[] = [];
    for (const { asset } of matched) {
      onProgress(`Downloading ${asset.name}...`);
      const result = await this.downloadAsset(asset, options.outputDir, options.token);
      results.push(result);
      onProgress(`✓ Downloaded to ${result.localPath}`);
    }

    return results;
  }

  private mapReleaseInfo(data: any): ReleaseInfo {
    return {
      id: data.id,
      tagName: data.tag_name,
      name: data.name,
      draft: data.draft,
      prerelease: data.prerelease,
      createdAt: data.created_at,
      publishedAt: data.published_at,
      htmlUrl: data.html_url,
      assets: data.assets.map((asset: any) => ({
        id: asset.id,
        name: asset.name,
        contentType: asset.content_type,
        size: asset.size,
        downloadCount: asset.download_count,
        browserDownloadUrl: asset.browser_download_url,
        createdAt: asset.created_at,
        updatedAt: asset.updated_at,
      })),
    };
  }
}

/**
 * Convenience function for quick downloads
 */
export async function downloadFromGitHub(
  repoUrl: string,
  patterns: string | string[],
  options: {
    outputDir: string;
    version?: string;
    token?: string;
  }
): Promise<DownloadResult[]> {
  const downloader = new GitHubReleaseDownloader({ token: options.token });
  return downloader.download(repoUrl, patterns, options);
}
