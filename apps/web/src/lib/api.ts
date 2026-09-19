import type {
  RoutePlanInput,
  RoutePlanResult,
  SimulationTimeline,
} from '@econav/core';
import '@/lib/sdk-config';
import { requestJson } from '@econav/sdk';

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
