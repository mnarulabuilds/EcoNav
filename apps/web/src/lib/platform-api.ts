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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function authHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('cityconnect_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error ?? `HTTP ${response.status}`);
  }
  return response.json();
}

export async function login(phone: string, otp: string): Promise<{ token: string; user: PlatformUser }> {
  return api('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });
}

export async function fetchMe(): Promise<{ user: PlatformUser }> {
  return api('/api/v1/auth/me');
}

export async function fetchModules(): Promise<{ modules: PlatformModuleMeta[]; wards: Ward[] }> {
  return api('/api/v1/platform/modules');
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
  return api('/api/v1/civic/tickets', {
    method: 'POST',
    body: JSON.stringify({ ...body, domain: 'civic' }),
  });
}

export async function fetchCivicTickets(): Promise<{ tickets: ServiceTicket[] }> {
  return api('/api/v1/civic/tickets');
}

export async function fetchUtilityTypes(): Promise<{ types: UtilityRequestType[] }> {
  return api('/api/v1/utilities/types');
}

export async function createUtilityTicket(body: {
  category: string;
  title: string;
  description: string;
  wardId: string;
}): Promise<{ ticket: ServiceTicket }> {
  return api('/api/v1/utilities/tickets', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchSchemes(): Promise<{ schemes: GovernmentScheme[] }> {
  return api('/api/v1/schemes');
}

export async function matchSchemes(profile: Record<string, unknown>): Promise<{
  results: { scheme: GovernmentScheme; match: { eligible: boolean; reasons: string[] } }[];
}> {
  return api('/api/v1/schemes/match', { method: 'POST', body: JSON.stringify(profile) });
}

export async function fetchHealth(wardId?: string): Promise<{ facilities: HealthFacility[] }> {
  const q = wardId ? `?wardId=${encodeURIComponent(wardId)}` : '';
  return api(`/api/v1/health/facilities${q}`);
}

export async function fetchEducation(): Promise<{ programs: EducationProgram[] }> {
  return api('/api/v1/education/programs');
}

export async function fetchMobility(): Promise<{ assets: MobilityAsset[] }> {
  return api('/api/v1/mobility/assets');
}

export async function fetchEmergency(): Promise<{ resources: EmergencyResource[] }> {
  return api('/api/v1/emergency/resources');
}

export async function fetchCommunity(): Promise<{ events: CommunityEvent[] }> {
  return api('/api/v1/community/events');
}

export async function enrollCommunity(id: string): Promise<{ ok: boolean; message: string }> {
  return api(`/api/v1/community/events/${id}/enroll`, { method: 'POST' });
}

export async function fetchTransparency(wardId?: string): Promise<{ projects: TransparencyProject[] }> {
  const q = wardId ? `?wardId=${encodeURIComponent(wardId)}` : '';
  return api(`/api/v1/transparency/projects${q}`);
}

export async function fetchDropPoints(): Promise<{ dropPoints: WasteDropPoint[] }> {
  return api('/api/v1/waste/drop-points');
}

export async function fetchPickups(): Promise<{ pickups: PickupBooking[] }> {
  return api('/api/v1/waste/pickups');
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
  return api('/api/v1/waste/pickups', { method: 'POST', body: JSON.stringify(body) });
}

export async function fetchAdminDashboard(): Promise<{ stats: AdminDashboardStats }> {
  return api('/api/v1/admin/dashboard');
}

export async function fetchAdminTickets(): Promise<{ tickets: ServiceTicket[] }> {
  return api('/api/v1/admin/tickets');
}

export async function updateTicketStatus(
  id: string,
  status: ServiceTicket['status'],
): Promise<{ ticket: ServiceTicket }> {
  return api(`/api/v1/admin/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
