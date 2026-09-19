import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const config = JSON.parse(readFileSync(join(root, 'deploy.config.json'), 'utf8'));

const { web, webAlias } = config.domains;
const origins = new Set([
  `https://${web}`,
  `https://${webAlias}`,
  config.urls.web,
  ...(config.cors?.extraOrigins ?? []),
]);

for (const value of origins) {
  if (!value || !value.startsWith('https://')) {
    origins.delete(value);
  }
}

process.stdout.write([...origins].join(','));
