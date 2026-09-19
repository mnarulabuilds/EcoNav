import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

if (process.env.CI || process.env.HUSKY === '0') {
  process.exit(0);
}

if (!existsSync('.git')) {
  process.exit(0);
}

const result = spawnSync('npx', ['husky'], { stdio: 'ignore' });
process.exit(result.status === 0 ? 0 : 0);
