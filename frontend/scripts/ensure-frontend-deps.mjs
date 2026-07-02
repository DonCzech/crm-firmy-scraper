import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const cwd = process.cwd();
const nodeModules = path.join(cwd, 'node_modules');
const pluginReact = path.join(nodeModules, '@vitejs', 'plugin-react', 'package.json');
const vitePackage = path.join(nodeModules, 'vite', 'package.json');
const viteChunksDir = path.join(nodeModules, 'vite', 'dist', 'node', 'chunks');

function hasRequiredViteChunkFiles() {
  if (!fs.existsSync(viteChunksDir)) {
    return false;
  }

  const entries = fs.readdirSync(viteChunksDir);
  const hasCoreChunk = entries.some((entry) => entry === 'chunk.js' || entry.startsWith('dep-'));
  const hasConfigChunk = entries.some((entry) => entry === 'config.js' || entry.startsWith('dep-'));

  return hasCoreChunk && hasConfigChunk;
}

function isHealthyInstall() {
  return fs.existsSync(pluginReact) && fs.existsSync(vitePackage) && hasRequiredViteChunkFiles();
}

if (!isHealthyInstall()) {
  console.log('[ensure-deps] Broken or incomplete frontend dependencies detected. Running repair...');
  const install = spawnSync('npm', ['install', '--include=dev', '--force'], {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_include: 'dev',
      npm_config_omit: '',
    },
  });

  if (install.status !== 0 || !isHealthyInstall()) {
    console.error('[ensure-deps] Dependency repair failed. Please run: npm install --include=dev --force');
    process.exit(1);
  }
}
