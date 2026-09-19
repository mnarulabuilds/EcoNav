import { describe, expect, it } from 'vitest';
import { SEED_SCHEMES, type CitizenProfile, type GovernmentScheme } from '@econav/platform';
import { evaluateScheme, matchSchemes } from './evaluate.js';

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

  it('sorts eligible schemes first', () => {
    const results = matchSchemes(SEED_SCHEMES, {
      age: 16,
      annualIncomeInr: 100000,
      gender: 'female',
      category: 'general',
      isDisabled: false,
      isStudent: true,
      wardId: 'ward-1',
    });
    if (results.length >= 2 && results[0]!.match.eligible !== results[1]!.match.eligible) {
      expect(results[0]!.match.eligible).toBe(true);
    }
  });
});

describe('evaluateScheme operators', () => {
  const baseScheme: GovernmentScheme = {
    id: 'test-scheme',
    name: 'Test',
    level: 'state',
    department: 'Test',
    summary: 'Test scheme',
    benefits: ['Support'],
    documents: ['Aadhaar'],
    tags: ['test'],
    active: true,
    rules: [],
  };

  const profile: CitizenProfile = {
    age: 30,
    annualIncomeInr: 200000,
    gender: 'male',
    category: 'obc',
    isDisabled: false,
    isStudent: false,
    wardId: 'ward-1',
  };

  it('evaluates gte, lte, eq, and in operators', () => {
    const scheme: GovernmentScheme = {
      ...baseScheme,
      rules: [
        { field: 'age', operator: 'gte', value: 18, label: 'Age 18+' },
        { field: 'annualIncomeInr', operator: 'lte', value: 300000, label: 'Income cap' },
        { field: 'category', operator: 'in', value: ['obc', 'sc'], label: 'Category' },
        { field: 'isStudent', operator: 'eq', value: false, label: 'Not student' },
      ],
    };
    const match = evaluateScheme(scheme, profile);
    expect(match.eligible).toBe(true);
    expect(match.missingDocuments).toEqual([]);
  });

  it('marks ineligible and lists missing documents', () => {
    const scheme: GovernmentScheme = {
      ...baseScheme,
      rules: [{ field: 'age', operator: 'lte', value: 10, label: 'Child only' }],
    };
    const match = evaluateScheme(scheme, profile);
    expect(match.eligible).toBe(false);
    expect(match.missingDocuments).toEqual(['Aadhaar']);
  });

  it('ignores inactive schemes in matchSchemes', () => {
    const inactive: GovernmentScheme = { ...baseScheme, id: 'inactive', active: false };
    const results = matchSchemes([inactive], profile);
    expect(results).toHaveLength(0);
  });
});
