import { ApiError } from './api-client';
import type { Messages } from '@/i18n/locales/en';

export function resolveUserMessage(error: unknown, t: Messages['errors']): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return t.unauthorized;
    if (error.status === 403) return t.forbidden;
    if (error.status === 404) return t.notFound;
    if (error.status === 400) return error.message || t.validation;
    if (error.status >= 500) return t.generic;
    return error.message || t.generic;
  }
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return t.network;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return t.generic;
}
