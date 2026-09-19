import { describe, expect, it } from 'vitest';
import { DEMO_OTP, PLATFORM_MODULES } from './modules.js';
import { SEED_COMMUNITY, SEED_SCHEMES, SEED_USERS, SEED_WARDS } from './seed.js';

describe('platform seed data', () => {
  it('exposes demo OTP and module catalog', () => {
    expect(DEMO_OTP).toBe('123456');
    expect(PLATFORM_MODULES.length).toBeGreaterThanOrEqual(8);
    expect(PLATFORM_MODULES.some((m) => m.id === 'civic')).toBe(true);
    expect(PLATFORM_MODULES.every((m) => m.citizenPath.startsWith('/citizen/'))).toBe(true);
  });

  it('includes demo users for each role', () => {
    const phones = SEED_USERS.map((u) => u.phone);
    expect(phones).toContain('9999999999');
    expect(phones).toContain('8888888888');
    expect(phones).toContain('7777777777');
  });

  it('has wards and active schemes', () => {
    expect(SEED_WARDS.length).toBeGreaterThan(0);
    expect(SEED_SCHEMES.some((s) => s.active)).toBe(true);
    expect(SEED_COMMUNITY.length).toBeGreaterThan(0);
  });
});
