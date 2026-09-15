import type {
  CitizenProfile,
  GovernmentScheme,
  SchemeMatchResult,
  SchemeRule,
} from '@econav/platform';

function evaluateRule(rule: SchemeRule, profile: CitizenProfile): { pass: boolean; reason: string } {
  const value = profile[rule.field];
  let pass = false;

  switch (rule.operator) {
    case 'lte':
      pass = typeof value === 'number' && typeof rule.value === 'number' && value <= rule.value;
      break;
    case 'gte':
      pass = typeof value === 'number' && typeof rule.value === 'number' && value >= rule.value;
      break;
    case 'eq':
      pass = value === rule.value;
      break;
    case 'in':
      pass = Array.isArray(rule.value) && rule.value.includes(String(value));
      break;
    default:
      pass = false;
  }

  return {
    pass,
    reason: pass ? `Met: ${rule.label}` : `Not met: ${rule.label}`,
  };
}

export function evaluateScheme(scheme: GovernmentScheme, profile: CitizenProfile): SchemeMatchResult {
  const reasons: string[] = [];
  let eligible = true;

  for (const rule of scheme.rules) {
    const result = evaluateRule(rule, profile);
    reasons.push(result.reason);
    if (!result.pass) {
      eligible = false;
    }
  }

  return {
    schemeId: scheme.id,
    eligible,
    reasons,
    missingDocuments: eligible ? [] : [...scheme.documents],
  };
}

export function matchSchemes(
  schemes: GovernmentScheme[],
  profile: CitizenProfile,
): { scheme: GovernmentScheme; match: SchemeMatchResult }[] {
  return schemes
    .filter((s) => s.active)
    .map((scheme) => ({
      scheme,
      match: evaluateScheme(scheme, profile),
    }))
    .sort((a, b) => Number(b.match.eligible) - Number(a.match.eligible));
}
