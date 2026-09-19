'use client';

import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { fetchEmergency } from '@/lib/platform-api';
import type { EmergencyResource } from '@econav/platform';

const FAQ = [
  {
    q: 'How do I sign in?',
    a: 'Use demo OTP 123456. Citizen phone 9999999999, official 8888888888, field staff 7777777777.',
  },
  {
    q: 'Why does the map or form fail?',
    a: 'Ensure the API is running (npm run dev:api) and NEXT_PUBLIC_API_URL points to it. A banner appears at the top when the API is unreachable.',
  },
  {
    q: 'Is my data saved?',
    a: 'With Docker Postgres (npm run db:up), tickets and bookings persist. In memory-only mode, data resets when the API restarts.',
  },
  {
    q: 'Who can access the official console?',
    a: 'Users with role official or field_staff. Citizens see an access message on /admin.',
  },
];

export default function HelpPage() {
  const [helplines, setHelplines] = useState<EmergencyResource[]>([]);

  useEffect(() => {
    fetchEmergency()
      .then((d) => setHelplines(d.resources.slice(0, 6)))
      .catch(() => setHelplines([]));
  }, []);

  return (
    <PlatformShell title="Help & support" subtitle="Demo guide and helplines" variant="citizen">
      <div className="two-col">
        <section className="panel">
          <h2>Quick start</h2>
          <ol className="help-steps">
            <li>Run <code>npm run dev</code> from the project root.</li>
            <li>Open the citizen portal and sign in with the demo OTP.</li>
            <li>Report an issue under Civic, then track it under Track.</li>
          </ol>
        </section>
        <section className="panel">
          <h2>Helplines</h2>
          <ul className="data-list">
            {helplines.map((h) => (
              <li key={h.id}>
                <strong>{h.name}</strong>
                <div className="muted">{h.type}</div>
                {h.phone && (
                  <a href={`tel:${h.phone.replace(/\s/g, '')}`} className="help-phone">
                    {h.phone}
                  </a>
                )}
              </li>
            ))}
            {helplines.length === 0 && <p className="muted">Helplines load from the API when online.</p>}
          </ul>
        </section>
      </div>
      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2>FAQ</h2>
        <dl className="faq-list">
          {FAQ.map((item) => (
            <div key={item.q} className="faq-item">
              <dt>{item.q}</dt>
              <dd className="muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </PlatformShell>
  );
}
