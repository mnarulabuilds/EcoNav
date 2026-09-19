import { PLATFORM_MODULES } from '@econav/platform';
import type { Messages } from '@/i18n/locales/en';

export type NavItem = { href: string; moduleId: keyof Messages['modules'] };

const MODULE_ITEMS: NavItem[] = PLATFORM_MODULES.map((mod) => ({
  href: mod.citizenPath,
  moduleId: mod.id as keyof Messages['modules'],
}));

export function citizenNav(): { primary: NavItem[]; more: NavItem[] } {
  return { primary: MODULE_ITEMS.slice(0, 5), more: MODULE_ITEMS.slice(5) };
}

export function adminNav(): NavItem[] {
  return [
    { href: '/admin', moduleId: 'dashboard' as keyof Messages['modules'] },
    { href: '/admin/tickets', moduleId: 'tickets' as keyof Messages['modules'] },
    { href: '/admin/waste-ops', moduleId: 'wasteOps' as keyof Messages['modules'] },
  ];
}

export function labelForNav(t: Messages, key: keyof Messages['modules']): string {
  return t.modules[key];
}
