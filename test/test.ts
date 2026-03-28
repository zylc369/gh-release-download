#!/usr/bin/env bun

import { downloadFromGitHub, GitHubReleaseDownloader } from '../src/index.js';

const FRIDA_REPO = 'https://github.com/frida/frida';
const OUTPUT_DIR = 'test/intermediate';

async function testListAssets() {
  console.log('\n📋 Test 1: List assets from latest release\n');
  
  const downloader = new GitHubReleaseDownloader();
  const { parseRepoUrl } = await import('../src/utils.js');
  const { owner, repo } = parseRepoUrl(FRIDA_REPO);
  
  const release = await downloader.getRelease(owner, repo);
  console.log(`Latest release: ${release.tagName}`);
  console.log(`Assets count: ${release.assets.length}`);
  console.log('\nFirst 10 assets:');
  release.assets.slice(0, 10).forEach(asset => {
    console.log(`  - ${asset.name}`);
  });
}

async function testMatchPattern() {
  console.log('\n🔍 Test 2: Match assets with glob pattern\n');
  
  const downloader = new GitHubReleaseDownloader();
  const { parseRepoUrl } = await import('../src/utils.js');
  const { owner, repo } = parseRepoUrl(FRIDA_REPO);
  
  const release = await downloader.getRelease(owner, repo);
  const pattern = 'frida-gadget-*-android-arm*.so.xz';
  const matched = downloader.matchAssets(release.assets, pattern);
  
  console.log(`Pattern: ${pattern}`);
  console.log(`Matched: ${matched.length} asset(s)`);
  matched.forEach(({ asset }) => {
    console.log(`  - ${asset.name}`);
  });
}

async function testDownload() {
  console.log('\n⬇️  Test 3: Download matched assets\n');
  
  const pattern = 'frida-server-*-android-arm64.xz';
  
  console.log(`Repository: ${FRIDA_REPO}`);
  console.log(`Pattern: ${pattern}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  
  try {
    const results = await downloadFromGitHub(FRIDA_REPO, pattern, {
      outputDir: OUTPUT_DIR,
    });
    
    console.log('\n✅ Download completed!');
    results.forEach(result => {
      console.log(`  - ${result.localPath} (${result.size} bytes)`);
    });
  } catch (error) {
    console.error('❌ Download failed:', (error as Error).message);
  }
}

async function runTests() {
  console.log('🧪 GitHub Release Download - Test Suite');
  console.log('========================================');
  
  try {
    await testListAssets();
    await testMatchPattern();
    await testDownload();
    
    console.log('\n✅ All tests completed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', (error as Error).message);
    process.exit(1);
  }
}

runTests();
