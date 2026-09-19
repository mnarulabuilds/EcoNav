import type {
  AdminDashboardStats,
  CommunityEvent,
  EducationProgram,
  EmergencyResource,
  GovernmentScheme,
  HealthFacility,
  MobilityAsset,
  PickupBooking,
  PlatformModuleMeta,
  PlatformUser,
  ServiceTicket,
  TransparencyProject,
  UtilityRequestType,
  Ward,
  WasteDropPoint,
} from '@econav/platform';
import { requestJson } from './api-client.js';

export type TicketListResponse = {
  tickets: ServiceTicket[];
  nextCursor: string | null;
};

function ticketQuery(params?: { limit?: number; cursor?: string }): string {
  if (!params?.limit && !params?.cursor) return '';
  const q = new URLSearchParams();
  if (params.limit) q.set('limit', String(params.limit));
  if (params.cursor) q.set('cursor', params.cursor);
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function login(
  phone: string,
  otp: string,
  preferredLanguage?: PlatformUser['preferredLanguage'],
): Promise<{ token: string; user: PlatformUser }> {
  return requestJson('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, otp, preferredLanguage }),
  });
}

export async function logoutSession(): Promise<{ ok: boolean }> {
  return requestJson('/api/v1/auth/logout', { method: 'POST' });
}

export async function fetchMe(): Promise<{ user: PlatformUser }> {
  return requestJson('/api/v1/auth/me');
}

export async function fetchModules(): Promise<{ modules: PlatformModuleMeta[]; wards: Ward[] }> {
  return requestJson('/api/v1/platform/modules');
}

export async function createCivicTicket(body: {
  category: string;
  title: string;
  description: string;
  wardId: string;
  lat?: number;
  lng?: number;
  priority?: ServiceTicket['priority'];
}): Promise<{ ticket: ServiceTicket }> {
  return requestJson('/api/v1/civic/tickets', {
    method: 'POST',
    body: JSON.stringify({ ...body, domain: 'civic' }),
  });
}

export async function fetchCivicTickets(params?: {
  limit?: number;
  cursor?: string;
}): Promise<TicketListResponse> {
  return requestJson(`/api/v1/civic/tickets${ticketQuery(params)}`);
}

export async function fetchUtilityTypes(): Promise<{ types: UtilityRequestType[] }> {
  return requestJson('/api/v1/utilities/types');
}

export async function createUtilityTicket(body: {
  category: string;
  title: string;
  description: string;
  wardId: string;
}): Promise<{ ticket: ServiceTicket }> {
  return requestJson('/api/v1/utilities/tickets', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchSchemes(): Promise<{ schemes: GovernmentScheme[] }> {
  return requestJson('/api/v1/schemes');
}

export async function matchSchemes(profile: Record<string, unknown>): Promise<{
  results: { scheme: GovernmentScheme; match: { eligible: boolean; reasons: string[] } }[];
}> {
  return requestJson('/api/v1/schemes/match', { method: 'POST', body: JSON.stringify(profile) });
}

export async function fetchHealth(wardId?: string): Promise<{ facilities: HealthFacility[] }> {
  const q = wardId ? `?wardId=${encodeURIComponent(wardId)}` : '';
  return requestJson(`/api/v1/health/facilities${q}`);
}

export async function fetchEducation(): Promise<{ programs: EducationProgram[] }> {
  return requestJson('/api/v1/education/programs');
}

export async function fetchMobility(): Promise<{ assets: MobilityAsset[] }> {
  return requestJson('/api/v1/mobility/assets');
}

export async function fetchEmergency(): Promise<{ resources: EmergencyResource[] }> {
  return requestJson('/api/v1/emergency/resources');
}

export async function fetchCommunity(): Promise<{ events: CommunityEvent[] }> {
  return requestJson('/api/v1/community/events');
}

export async function enrollCommunity(id: string): Promise<{ ok: boolean; message: string }> {
  return requestJson(`/api/v1/community/events/${id}/enroll`, { method: 'POST' });
}

export async function fetchTransparency(wardId?: string): Promise<{ projects: TransparencyProject[] }> {
  const q = wardId ? `?wardId=${encodeURIComponent(wardId)}` : '';
  return requestJson(`/api/v1/transparency/projects${q}`);
}

export async function fetchDropPoints(): Promise<{ dropPoints: WasteDropPoint[] }> {
  return requestJson('/api/v1/waste/drop-points');
}

export async function fetchPickups(): Promise<{ pickups: PickupBooking[] }> {
  return requestJson('/api/v1/waste/pickups');
}

export async function createPickup(body: {
  type: 'bulk_waste' | 'ewaste';
  wardId: string;
  address: string;
  lat: number;
  lng: number;
  items: string;
  scheduledDate: string;
}): Promise<{ booking: PickupBooking }> {
  return requestJson('/api/v1/waste/pickups', { method: 'POST', body: JSON.stringify(body) });
}

export async function fetchAdminDashboard(): Promise<{ stats: AdminDashboardStats }> {
  return requestJson('/api/v1/admin/dashboard');
}

export async function fetchAdminTickets(params?: {
  limit?: number;
  cursor?: string;
}): Promise<TicketListResponse> {
  return requestJson(`/api/v1/admin/tickets${ticketQuery(params)}`);
}

export async function updateTicketStatus(
  id: string,
  status: ServiceTicket['status'],
): Promise<{ ticket: ServiceTicket }> {
  return requestJson(`/api/v1/admin/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    await requestJson<{ status: string }>('/api/health');
    return true;
  } catch {
    return false;
  }
}
