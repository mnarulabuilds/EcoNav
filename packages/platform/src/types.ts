export type UserRole = 'citizen' | 'official' | 'field_staff' | 'partner';

export type TicketDomain =
  | 'civic'
  | 'waste'
  | 'utilities'
  | 'health'
  | 'education'
  | 'mobility'
  | 'emergency'
  | 'community';

export type TicketStatus =
  | 'submitted'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'escalated';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Ward extends GeoPoint {
  id: string;
  name: string;
  ulbName: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  wardId?: string;
  preferredLanguage: 'en' | 'hi';
  createdAt: string;
}

export interface ServiceTicket {
  id: string;
  domain: TicketDomain;
  category: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  wardId: string;
  reporterId: string;
  assigneeId?: string;
  location?: GeoPoint;
  photoUrl?: string;
  slaHours: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export type SchemeLevel = 'central' | 'state' | 'local';

export interface SchemeRule {
  field: keyof CitizenProfile;
  operator: 'lte' | 'gte' | 'eq' | 'in';
  value: number | string | boolean | string[];
  label: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  level: SchemeLevel;
  department: string;
  summary: string;
  benefits: string[];
  documents: string[];
  applyUrl?: string;
  helpline?: string;
  rules: SchemeRule[];
  tags: string[];
  active: boolean;
}

export interface CitizenProfile {
  age: number;
  annualIncomeInr: number;
  gender: 'female' | 'male' | 'other';
  category: 'general' | 'sc' | 'st' | 'obc' | 'ews';
  isDisabled: boolean;
  isStudent: boolean;
  wardId: string;
}

export interface SchemeMatchResult {
  schemeId: string;
  eligible: boolean;
  reasons: string[];
  missingDocuments: string[];
}

export interface HealthFacility {
  id: string;
  name: string;
  type: 'phc' | 'chc' | 'hospital' | 'blood_bank';
  wardId: string;
  lat: number;
  lng: number;
  hours: string;
  services: string[];
  phone?: string;
}

export interface EducationProgram {
  id: string;
  title: string;
  type: 'scholarship' | 'skill' | 'library' | 'job_fair';
  wardId: string;
  summary: string;
  eligibility: string;
  applyUrl?: string;
  startsAt?: string;
}

export interface MobilityAsset {
  id: string;
  name: string;
  type: 'ev_charging' | 'parking' | 'bus_stop' | 'cycle_lane';
  lat: number;
  lng: number;
  status: 'available' | 'limited' | 'closed';
  meta?: string;
}

export interface EmergencyResource {
  id: string;
  name: string;
  type: 'shelter' | 'police' | 'fire' | 'hospital' | 'helpline';
  lat?: number;
  lng?: number;
  phone: string;
  notes?: string;
}

export interface UtilityRequestType {
  id: string;
  name: string;
  department: string;
  slaHours: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  type: 'volunteer' | 'ward_meeting' | 'drive';
  wardId: string;
  lat: number;
  lng: number;
  startsAt: string;
  slots?: number;
  enrolled?: number;
}

export interface TransparencyProject {
  id: string;
  title: string;
  wardId: string;
  budgetInr: number;
  status: 'planned' | 'ongoing' | 'completed';
  completionPercent: number;
  summary: string;
}

export interface WasteDropPoint {
  id: string;
  name: string;
  type: 'bin' | 'ewaste' | 'recycling';
  lat: number;
  lng: number;
  wardId: string;
  accepts: string[];
}

export interface PickupBooking {
  id: string;
  type: 'bulk_waste' | 'ewaste';
  citizenId: string;
  wardId: string;
  address: string;
  lat: number;
  lng: number;
  items: string;
  scheduledDate: string;
  status: 'requested' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface PlatformModuleMeta {
  id: string;
  title: string;
  description: string;
  citizenPath: string;
  icon: string;
}

export interface AdminDashboardStats {
  openTickets: number;
  slaBreaches: number;
  resolvedThisWeek: number;
  activeSchemes: number;
  pendingPickups: number;
  communityEvents: number;
  ticketsByDomain: Record<TicketDomain, number>;
  ticketsByWard: { wardId: string; wardName: string; count: number }[];
}
