import type { Messages } from '@/i18n/locales/en';

export type NavItem = { href: string; labelKey: keyof Messages['nav'] };

export function citizenNav(): { primary: NavItem[]; more: NavItem[] } {
  const items: NavItem[] = [
    { href: '/citizen', labelKey: 'home' },
    { href: '/citizen/civic', labelKey: 'report' },
    { href: '/citizen/track', labelKey: 'track' },
    { href: '/citizen/schemes', labelKey: 'schemes' },
    { href: '/citizen/waste', labelKey: 'waste' },
    { href: '/citizen/health', labelKey: 'health' },
    { href: '/citizen/emergency', labelKey: 'emergency' },
    { href: '/citizen/help', labelKey: 'help' },
  ];
  return { primary: items.slice(0, 5), more: items.slice(5) };
}

export function adminNav(): NavItem[] {
  return [
    { href: '/admin', labelKey: 'dashboard' },
    { href: '/admin/tickets', labelKey: 'tickets' },
    { href: '/admin/waste-ops', labelKey: 'wasteOps' },
  ];
}

export function labelForNav(t: Messages, key: keyof Messages['nav']): string {
  return t.nav[key];
}
