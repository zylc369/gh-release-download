#!/usr/bin/env node

import { Command } from 'commander';
import { GitHubReleaseDownloader } from './github-release.js';
import { formatBytes } from './utils.js';
import { PACKAGE_NAME, PACKAGE_VERSION, DESCRIPTION } from './constants.js';

const program = new Command();

program
  .name(PACKAGE_NAME)
  .description(DESCRIPTION)
  .version(PACKAGE_VERSION, '-v, --version')
  .argument('<github-url>', 'GitHub repository URL (e.g., https://github.com/owner/repo)')
  .argument('<patterns...>', 'Glob patterns for files to download (e.g., "*.zip", "app-*-linux.tar.gz")')
  .option('-t, --tag <tag>', 'Version tag to download (defaults to latest release)')
  .option('-o, --output <dir>', 'Output directory (defaults to current directory)', process.cwd())
  .option('-k, --token <token>', 'GitHub token for private repositories or higher rate limits')
  .option('--list', 'List matching assets without downloading', false)
  .action(async (githubUrl: string, patterns: string[], options: any) => {
    try {
      const downloader = new GitHubReleaseDownloader({ token: options.token });

      if (options.list) {
        const { owner, repo } = await import('./utils.js').then(m => m.parseRepoUrl(githubUrl));
        const release = await downloader.getRelease(owner, repo, options.tag);
        
        console.log(`\nRelease: ${release.tagName}`);
        console.log(`Assets: ${release.assets.length}\n`);
        
        for (const asset of release.assets) {
          console.log(`  ${asset.name} (${formatBytes(asset.size)})`);
        }
        
        console.log('\nMatching assets:');
        const matched = downloader.matchAssets(release.assets, patterns);
        
        if (matched.length === 0) {
          console.log('  No matches found');
        } else {
          for (const { asset, matchedPattern } of matched) {
            console.log(`  ✓ ${asset.name} (matched: ${matchedPattern})`);
          }
        }
        
        return;
      }

      console.log('\n🚀 Starting download...\n');
      
      const results = await downloader.download(githubUrl, patterns, {
        version: options.tag,
        outputDir: options.output,
        token: options.token,
        onProgress: (msg) => console.log(msg),
      });

      console.log('\n✅ Download complete!\n');
      console.log('Downloaded files:');
      
      let totalSize = 0;
      for (const result of results) {
        console.log(`  ✓ ${result.localPath} (${formatBytes(result.size)})`);
        totalSize += result.size;
      }
      
      console.log(`\nTotal: ${results.length} file(s), ${formatBytes(totalSize)}`);
    } catch (error) {
      console.error('\n❌ Error:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse();
