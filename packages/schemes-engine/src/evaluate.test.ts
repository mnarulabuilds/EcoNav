import { describe, expect, it } from 'vitest';
import { SEED_SCHEMES } from '@econav/platform';
import { matchSchemes } from './evaluate.js';

describe('matchSchemes', () => {
  it('finds eligible schemes for a qualifying profile', () => {
    const results = matchSchemes(SEED_SCHEMES, {
      age: 16,
      annualIncomeInr: 100000,
      gender: 'female',
      category: 'general',
      isDisabled: false,
      isStudent: true,
      wardId: 'ward-1',
    });

    const girls = results.find((r) => r.scheme.id === 'scheme-girls-scholarship');
    expect(girls?.match.eligible).toBe(true);
  });

  it('marks ineligible when rules fail', () => {
    const results = matchSchemes(SEED_SCHEMES, {
      age: 25,
      annualIncomeInr: 800000,
      gender: 'male',
      category: 'general',
      isDisabled: false,
      isStudent: false,
      wardId: 'ward-1',
    });

    const girls = results.find((r) => r.scheme.id === 'scheme-girls-scholarship');
    expect(girls?.match.eligible).toBe(false);
  });
});
