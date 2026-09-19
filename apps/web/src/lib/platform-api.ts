import '@/lib/sdk-config';

export {
  ApiError,
  checkApiHealth,
  createCivicTicket,
  createPickup,
  createUtilityTicket,
  enrollCommunity,
  fetchAdminDashboard,
  fetchAdminTickets,
  fetchCivicTickets,
  fetchCommunity,
  fetchDropPoints,
  fetchEducation,
  fetchEmergency,
  fetchHealth,
  fetchMe,
  fetchMobility,
  fetchModules,
  fetchPickups,
  fetchSchemes,
  fetchTransparency,
  fetchUtilityTypes,
  getApiBaseUrl,
  logoutSession,
  matchSchemes,
  updateTicketStatus,
} from '@econav/sdk';

export type { TicketListResponse } from '@econav/sdk';
