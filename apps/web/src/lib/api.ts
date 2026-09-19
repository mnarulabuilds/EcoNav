import type {
  RoutePlanInput,
  RoutePlanResult,
  SimulationTimeline,
} from '@econav/core';
import { requestJson } from './api-client';

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

export async function checkHealth(): Promise<boolean> {
  try {
    await requestJson<{ status: string }>('/api/health');
    return true;
  } catch {
    return false;
  }
}
