/**
 * Utility functions
 */

import { ParsedRepoUrl } from './types.js';

/**
 * Parse GitHub repository URL to extract owner and repo name
 * Supports various formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/
 * - github.com/owner/repo
 * - owner/repo
 */
export function parseRepoUrl(url: string): ParsedRepoUrl {
  let cleanUrl = url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
  
  if (cleanUrl.startsWith('github.com/')) {
    cleanUrl = cleanUrl.replace('github.com/', '');
  }
  
  const parts = cleanUrl.split('/');
  
  if (parts.length < 2) {
    throw new Error(
      `Invalid GitHub repository URL: ${url}. Expected format: https://github.com/owner/repo or owner/repo`
    );
  }
  
  const owner = parts[0];
  const repo = parts[1];
  
  if (!owner || !repo) {
    throw new Error(
      `Invalid GitHub repository URL: ${url}. Could not extract owner and repo name.`
    );
  }
  
  return { owner, repo };
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Ensure directory exists, create if not
 */
export async function ensureDir(dir: string): Promise<void> {
  const fs = await import('fs/promises');
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw new Error(`Failed to create directory "${dir}": ${(error as Error).message}`);
    }
  }
}

/**
 * Get current working directory
 */
export function getCwd(): string {
  return process.cwd();
}
