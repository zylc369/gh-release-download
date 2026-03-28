/**
 * GitHub Release Download Tool
 * Core types and interfaces
 */

/**
 * Options for download function (excluding repoUrl and patterns which are separate parameters)
 */
export interface DownloadFunctionOptions {
  /** Output directory for downloaded files (required for SDK usage, optional for CLI) */
  outputDir: string;
  
  /** Version tag to download (optional, defaults to latest) */
  version?: string;
  
  /** GitHub token for private repositories (optional) */
  token?: string;
  
  /** Progress callback for download status updates (optional) */
  onProgress?: (message: string) => void;
}

/**
 * @deprecated Use DownloadFunctionOptions instead.
 * This interface is kept for backwards compatibility but note that
 * repoUrl and patterns are separate parameters in the actual function signatures.
 */
export interface DownloadOptions {
  /** GitHub repository URL (required) */
  repoUrl: string;
  
  /** Version tag to download (optional, defaults to latest) */
  version?: string;
  
  /** Glob pattern(s) for files to download (required) */
  patterns: string | string[];
  
  /** GitHub token for private repositories (optional) */
  token?: string;
  
  /** Output directory for downloaded files (required for SDK usage, optional for CLI) */
  outputDir: string;
}

export interface ReleaseInfo {
  id: number;
  tagName: string;
  name: string | null;
  draft: boolean;
  prerelease: boolean;
  createdAt: string;
  publishedAt: string | null;
  htmlUrl: string;
  assets: ReleaseAsset[];
}

export interface ReleaseAsset {
  id: number;
  name: string;
  contentType: string;
  size: number;
  downloadCount: number;
  browserDownloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadResult {
  asset: ReleaseAsset;
  localPath: string;
  size: number;
}

export interface MatchedAsset {
  asset: ReleaseAsset;
  matchedPattern: string;
}

export interface ParsedRepoUrl {
  owner: string;
  repo: string;
}

export interface GitHubReleaseDownloaderConfig {
  /** GitHub API token (optional, for private repos or higher rate limits) */
  token?: string;
  
  /** Base URL for GitHub API (optional, defaults to https://api.github.com) */
  baseUrl?: string;
  
  /** User agent for API requests */
  userAgent?: string;
}
