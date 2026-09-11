import type { RoutePlanInput, RoutePlanResult, SimulationTimeline } from '@econav/core';
import Constants from 'expo-constants';

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:3001';

export interface PlanResponse {
  plan: RoutePlanResult;
  simulation: SimulationTimeline;
}

export async function planRoutes(input: RoutePlanInput): Promise<PlanResponse> {
  const response = await fetch(`${API_URL}/api/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error ?? `HTTP ${response.status}`);
  }

  return response.json();
}
