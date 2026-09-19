import { describe, it, expect, afterEach } from 'vitest';
import { buildCorsOptions } from './cors.js';

describe('buildCorsOptions', () => {
  afterEach(() => {
    delete process.env.CORS_ORIGINS;
    delete process.env.CORS_ALLOW_VERCEL;
  });

  it('allows vercel preview origins by default', () => {
    delete process.env.CORS_ALLOW_VERCEL;
    const { origin } = buildCorsOptions();
    const cb = viOriginCallback(origin!);
    cb('https://my-app.vercel.app', (err, allowed) => {
      expect(err).toBeNull();
      expect(allowed).toBe(true);
    });
  });

  it('denies vercel when CORS_ALLOW_VERCEL=false', () => {
    process.env.CORS_ALLOW_VERCEL = 'false';
    const { origin } = buildCorsOptions();
    const cb = viOriginCallback(origin!);
    cb('https://my-app.vercel.app', (err, allowed) => {
      expect(allowed).toBe(false);
    });
  });

  it('parses CORS_ORIGINS env', () => {
    process.env.CORS_ORIGINS = 'https://a.test,https://b.test';
    const { origin } = buildCorsOptions();
    const cb = viOriginCallback(origin!);
    cb('https://b.test', (err, allowed) => {
      expect(allowed).toBe(true);
    });
  });
});

function viOriginCallback(
  originFn: NonNullable<ReturnType<typeof buildCorsOptions>['origin']>,
) {
  if (typeof originFn === 'function') return originFn;
  throw new Error('expected origin callback');
}
