import { PLATFORM_MODULES } from '@econav/platform';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function fetchPlatformModules() {
  const response = await fetch(`${API_URL}/api/v1/platform/modules`);
  if (!response.ok) throw new Error('Failed to load modules');
  return response.json() as Promise<{ modules: typeof PLATFORM_MODULES }>;
}
