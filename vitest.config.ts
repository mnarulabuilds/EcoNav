import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/core/src/**/*.test.ts',
      'packages/schemes-engine/src/**/*.test.ts',
      'packages/platform/src/**/*.test.ts',
      'packages/db/src/**/*.test.ts',
      'apps/api/src/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'json-summary', 'html'],
      include: [
        'packages/core/src/**/*.ts',
        'packages/schemes-engine/src/**/*.ts',
        'packages/platform/src/**/*.ts',
        'packages/db/src/**/*.ts',
        'apps/api/src/**/*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/index.ts',
        'packages/platform/src/types.ts',
        'packages/core/src/types.ts',
        'packages/db/src/schema.ts',
        'packages/db/drizzle.config.ts',
        'packages/db/src/**/*-cli.ts',
        'packages/db/src/migrate.ts',
        'packages/db/src/client.ts',
        'packages/db/src/postgres-store.ts',
        'packages/db/src/seed.ts',
        'apps/api/src/server.ts',
        'apps/api/src/worker/**',
        'apps/api/src/store/index.ts',
        'apps/api/src/store/types.ts',
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 75,
        statements: 75,
      },
    },
  },
});
