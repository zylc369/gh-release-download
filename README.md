# bw-gh-release-fetch

A powerful CLI tool and library to fetch files from GitHub Releases with glob pattern support.

## Features

- 🚀 Fetch files from GitHub Releases using glob patterns
- 📦 Works as both CLI tool and npm library
- 🔍 Match multiple files with glob patterns (e.g., `*-linux-x64.tar.gz`)
- 🔐 Support for private repositories via GitHub token
- 📋 List release assets without downloading
- 🎯 Specify version or download latest release

## Installation

### As CLI Tool

```bash
# Using npx (no installation needed)
npx @zylc369/bw-gh-release-fetch <github-url> <patterns...>

# Using bunx (no installation needed)
bunx @zylc369/bw-gh-release-fetch <github-url> <patterns...>

# Or install globally
npm install -g @zylc369/bw-gh-release-fetch
bw-gh-release-fetch <github-url> <patterns...>
```

### As Library

```bash
npm install @zylc369/bw-gh-release-fetch
# or
bun add @zylc369/bw-gh-release-fetch
```

## CLI Usage

### Basic Download

```bash
# Download latest release
bw-gh-release-fetch https://github.com/owner/repo "*.zip"

# Download specific version
bw-gh-release-fetch https://github.com/owner/repo "*.zip" -t v1.0.0

# Download to specific directory
bw-gh-release-fetch https://github.com/owner/repo "*.zip" -o ./downloads

# Multiple patterns
bw-gh-release-fetch https://github.com/owner/repo "*-linux-*.tar.gz" "*-darwin-*.tar.gz"
```

### List Assets

```bash
# List all assets in latest release
bw-gh-release-fetch https://github.com/owner/repo --list "*"

# List matched assets
bw-gh-release-fetch https://github.com/owner/repo "*android*" --list
```

### Private Repository

```bash
# With GitHub token
bw-gh-release-fetch https://github.com/owner/private-repo "*.zip" -k YOUR_GITHUB_TOKEN
```

### CLI Options

| Option | Description |
|--------|-------------|
| `-t, --tag <tag>` | Version tag to download (defaults to latest) |
| `-o, --output <dir>` | Output directory (defaults to current directory) |
| `-k, --token <token>` | GitHub token for private repositories |
| `--list` | List matching assets without downloading |
| `-v, --version` | Output version number |
| `-h, --help` | Display help |

## Library Usage

**Note:** When using as a library, `outputDir` is **required**.

### Basic Usage

```typescript
import { downloadFromGitHub } from '@zylc369/bw-gh-release-fetch';

await downloadFromGitHub(
  'https://github.com/frida/frida',
  'frida-server-*-android-arm64.xz',
  { outputDir: './downloads' }
);
```

### With Options

```typescript
import { downloadFromGitHub } from '@zylc369/bw-gh-release-fetch';

const results = await downloadFromGitHub(
  'https://github.com/owner/repo',
  ['*-linux-*.tar.gz', '*-darwin-*.tar.gz'],
  {
    version: 'v1.0.0',
    outputDir: './downloads',
    token: process.env.GITHUB_TOKEN,
  }
);

results.forEach(result => {
  console.log(`Downloaded: ${result.localPath} (${result.size} bytes)`);
});
```

### Advanced Usage

```typescript
import { GitHubReleaseDownloader } from '@zylc369/bw-gh-release-fetch';

const downloader = new GitHubReleaseDownloader({
  token: process.env.GITHUB_TOKEN,
});

// Get release info
const release = await downloader.getRelease('owner', 'repo', 'v1.0.0');
console.log(`Release: ${release.tagName}`);
console.log(`Assets: ${release.assets.length}`);

// Match assets
const matched = downloader.matchAssets(release.assets, '*-linux-*');
console.log(`Matched ${matched.length} assets`);

// Download matched assets
for (const { asset } of matched) {
  await downloader.downloadAsset(asset, './downloads');
}
```

## API Reference

### `downloadFromGitHub(repoUrl, patterns, options)`

Quick download function.

**Parameters:**
- `repoUrl` (string, required): GitHub repository URL
- `patterns` (string | string[], required): Glob pattern(s) for files to download
- `options` (object, required):
  - `outputDir` (string, required): Output directory for downloaded files
  - `version` (string, optional): Version tag (defaults to latest)
  - `token` (string, optional): GitHub token for private repos

**Returns:** `Promise<DownloadResult[]>`

### `GitHubReleaseDownloader`

Main downloader class.

#### Constructor

```typescript
new GitHubReleaseDownloader(config?: {
  token?: string;
  baseUrl?: string;
  userAgent?: string;
})
```

#### Methods

- `getRelease(owner, repo, version?)`: Get release information
- `matchAssets(assets, patterns)`: Match assets against glob patterns
- `downloadAsset(asset, outputDir, token?)`: Download a single asset
- `download(repoUrl, patterns, options)`: Main download function (options.outputDir required)

## Glob Pattern Examples

| Pattern | Matches |
|---------|---------|
| `*.zip` | All ZIP files |
| `*-linux-*.tar.gz` | Linux tarballs |
| `app-*-darwin-x64.tar.gz` | macOS x64 builds |
| `frida-*-android-arm*.so.xz` | Android ARM libraries |
| `v*-windows-*.exe` | Windows executables with version prefix |

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Dev mode (run source directly)
bun run dev --help

# Type check
bun run typecheck

# Run tests
bun run test
```

## Publishing

```bash
# Dry run (check package contents)
bun run release:dry

# Publish to npm
npm publish --access public
```

## License

MIT
