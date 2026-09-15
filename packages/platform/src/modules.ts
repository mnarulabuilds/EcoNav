import type { PlatformModuleMeta } from './types.js';

export const PLATFORM_MODULES: PlatformModuleMeta[] = [
  {
    id: 'civic',
    title: 'Civic & Grievances',
    description: 'Report potholes, streetlights, water leaks, and track resolution.',
    citizenPath: '/citizen/civic',
    icon: '🏛️',
  },
  {
    id: 'waste',
    title: 'Waste & E-Waste',
    description: 'Schedule pickups, find drop points, and segregation guides.',
    citizenPath: '/citizen/waste',
    icon: '♻️',
  },
  {
    id: 'schemes',
    title: 'Schemes & Benefits',
    description: 'Discover schemes and check eligibility in plain language.',
    citizenPath: '/citizen/schemes',
    icon: '📋',
  },
  {
    id: 'health',
    title: 'Health & Wellness',
    description: 'PHC timings, camps, blood banks, and helplines.',
    citizenPath: '/citizen/health',
    icon: '🏥',
  },
  {
    id: 'education',
    title: 'Education & Skills',
    description: 'Scholarships, skill centers, libraries, and job fairs.',
    citizenPath: '/citizen/education',
    icon: '🎓',
  },
  {
    id: 'mobility',
    title: 'Mobility & Parking',
    description: 'EV charging, parking, bus stops, and road alerts.',
    citizenPath: '/citizen/mobility',
    icon: '🚌',
  },
  {
    id: 'emergency',
    title: 'Emergency & Safety',
    description: 'Helplines, shelters, and disaster readiness.',
    citizenPath: '/citizen/emergency',
    icon: '🆘',
  },
  {
    id: 'utilities',
    title: 'Utilities & Environment',
    description: 'Water tanker requests, air quality, and tree drives.',
    citizenPath: '/citizen/utilities',
    icon: '💧',
  },
  {
    id: 'community',
    title: 'Community',
    description: 'Volunteer, ward meetings, and local help network.',
    citizenPath: '/citizen/community',
    icon: '🤝',
  },
  {
    id: 'transparency',
    title: 'Transparency',
    description: 'Ward projects, budgets, and public updates.',
    citizenPath: '/citizen/transparency',
    icon: '📊',
  },
];

export const DEMO_OTP = '123456';

export const SLA_HOURS: Record<string, number> = {
  civic_pothole: 72,
  civic_streetlight: 48,
  civic_water: 24,
  utilities_water: 24,
  utilities_streetlight: 48,
  waste_bulk: 48,
  default: 72,
};
