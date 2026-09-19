import type { RoutePlanInput, RoutePlanResult, SimulationTimeline } from '@econav/core';
import Constants from 'expo-constants';
import { configureApiClient, requestJson } from '@econav/sdk';

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:3001';

configureApiClient({ getBaseUrl: () => API_URL });

export interface PlanResponse {
  plan: RoutePlanResult;
  simulation: SimulationTimeline;
}

export async function planRoutes(input: RoutePlanInput): Promise<PlanResponse> {
  return requestJson<PlanResponse>('/api/plan', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
