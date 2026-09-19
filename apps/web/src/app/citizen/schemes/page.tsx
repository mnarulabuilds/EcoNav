'use client';

import { useCallback, useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { fetchModules, fetchSchemes, matchSchemes } from '@/lib/platform-api';
import type { GovernmentScheme, Ward } from '@econav/platform';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { resolveUserMessage } from '@/lib/errors';

export default function SchemesPage() {
  const { push } = useToast();
  const { t } = useI18n();
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [results, setResults] = useState<
    { scheme: GovernmentScheme; match: { eligible: boolean; reasons: string[] } }[] | null
  >(null);
  const [profile, setProfile] = useState({
    age: 16,
    annualIncomeInr: 150000,
    gender: 'female',
    category: 'general',
    isDisabled: false,
    isStudent: true,
    wardId: 'ward-1',
  });

  const loadCatalog = useCallback(async () => {
    try {
      const [schemeData, moduleData] = await Promise.all([fetchSchemes(), fetchModules()]);
      setSchemes(schemeData.schemes);
      setWards(moduleData.wards);
    } catch (err) {
      push(resolveUserMessage(err, t.errors), 'error');
    }
  }, [push, t.errors]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  async function checkEligibility(e: React.FormEvent) {
    e.preventDefault();
    setMatching(true);
    setMatchError(null);
    try {
      const data = await matchSchemes(profile);
      setResults(data.results);
    } catch (err) {
      const msg = resolveUserMessage(err, t.errors);
      setMatchError(msg);
      push(msg, 'error');
    } finally {
      setMatching(false);
    }
  }

  return (
    <PlatformShell title="Schemes & Benefits" variant="citizen">
      <div className="two-col">
        <form className="panel form-stack" onSubmit={checkEligibility}>
          <h2>Check eligibility</h2>
          <label>
            Age
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
            />
          </label>
          <label>
            Annual income (INR)
            <input
              type="number"
              value={profile.annualIncomeInr}
              onChange={(e) => setProfile({ ...profile, annualIncomeInr: Number(e.target.value) })}
            />
          </label>
          <label>
            Gender
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Ward
            <select
              value={profile.wardId}
              onChange={(e) => setProfile({ ...profile, wardId: e.target.value })}
            >
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={profile.isStudent}
              onChange={(e) => setProfile({ ...profile, isStudent: e.target.checked })}
            />{' '}
            Currently a student
          </label>
          <label>
            <input
              type="checkbox"
              checked={profile.isDisabled}
              onChange={(e) => setProfile({ ...profile, isDisabled: e.target.checked })}
            />{' '}
            Person with disability (certificate on file)
          </label>
          {matchError && (
            <p className="form-error" role="alert">
              {matchError}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={matching}>
            {matching ? t.common.loading : 'Match schemes'}
          </button>
        </form>
        <div className="panel">
          <h2>All schemes</h2>
          <ul className="data-list">
            {schemes.map((s) => (
              <li key={s.id}>
                <strong>{s.name}</strong> — {s.level}
                <p className="muted">{s.summary}</p>
                {s.applyUrl && (
                  <a href={s.applyUrl} target="_blank" rel="noreferrer">
                    Apply on official portal
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {results && (
        <div className="panel" style={{ marginTop: '1rem' }}>
          <h2>Your matches</h2>
          <ul className="data-list">
            {results.map(({ scheme, match }) => (
              <li key={scheme.id}>
                <strong>{scheme.name}</strong>{' '}
                <span className="status-pill">{match.eligible ? 'Eligible' : 'Not eligible'}</span>
                <ul className="muted">
                  {match.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PlatformShell>
  );
}
