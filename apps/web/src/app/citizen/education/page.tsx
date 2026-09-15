'use client';

import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/PlatformShell';
import { fetchEducation } from '@/lib/platform-api';
import type { EducationProgram } from '@econav/platform';

export default function EducationPage() {
  const [programs, setPrograms] = useState<EducationProgram[]>([]);

  useEffect(() => {
    fetchEducation().then((d) => setPrograms(d.programs)).catch(() => setPrograms([]));
  }, []);

  return (
    <PlatformShell title="Education & Skills" variant="citizen">
      <ul className="data-list">
        {programs.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong> — {p.type}
            <p className="muted">{p.summary}</p>
            <p>Eligibility: {p.eligibility}</p>
            {p.applyUrl && (
              <a href={p.applyUrl} target="_blank" rel="noreferrer">
                Apply / register
              </a>
            )}
          </li>
        ))}
      </ul>
    </PlatformShell>
  );
}
