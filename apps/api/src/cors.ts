import type { FastifyCorsOptions } from '@fastify/cors';

const DEFAULT_ORIGINS = ['http://localhost:3000', 'http://localhost:8081'];

const PRODUCTION_ORIGINS = [
  'https://www.econav.in',
  'https://econav.in',
  'https://econav-web.vercel.app',
];

function parseExplicitOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (!raw) return [];
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
}

function isAllowedOrigin(origin: string, allowed: Set<string>): boolean {
  if (allowed.has(origin)) return true;

  // Vercel production + preview deployments
  if (process.env.CORS_ALLOW_VERCEL !== 'false') {
    if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) return true;
  }

  return false;
}

export function buildCorsOptions(): FastifyCorsOptions {
  const allowed = new Set([
    ...DEFAULT_ORIGINS,
    ...PRODUCTION_ORIGINS,
    ...parseExplicitOrigins(),
  ]);

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, isAllowedOrigin(origin, allowed));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
  };
}
