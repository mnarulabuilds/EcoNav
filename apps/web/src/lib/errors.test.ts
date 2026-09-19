import { describe, expect, it } from 'vitest';
import { ApiError } from '@econav/sdk';
import { resolveUserMessage } from './errors';
import { en } from '../i18n/locales/en';

const t = en.errors;

describe('resolveUserMessage', () => {
  it('maps HTTP status to localized messages', () => {
    expect(resolveUserMessage(new ApiError('x', 401), t)).toBe(t.unauthorized);
    expect(resolveUserMessage(new ApiError('x', 403), t)).toBe(t.forbidden);
    expect(resolveUserMessage(new ApiError('x', 404), t)).toBe(t.notFound);
    expect(resolveUserMessage(new ApiError('bad field', 400), t)).toBe('bad field');
    expect(resolveUserMessage(new ApiError('x', 503), t)).toBe(t.generic);
  });

  it('handles network failures', () => {
    expect(resolveUserMessage(new TypeError('Failed to fetch'), t)).toBe(t.network);
  });
});
