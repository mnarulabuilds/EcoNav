import { configureApiClient } from '@econav/sdk';

configureApiClient({
  getBaseUrl() {
    if (typeof window === 'undefined') {
      return (
        process.env.API_INTERNAL_URL ??
        process.env.NEXT_PUBLIC_API_URL ??
        'http://localhost:3001'
      ).replace(/\/$/, '');
    }
    return '/api/bff';
  },
  credentials: 'include',
});
