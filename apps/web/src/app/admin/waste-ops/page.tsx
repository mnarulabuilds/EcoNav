import dynamic from 'next/dynamic';

const PlannerApp = dynamic(() => import('@/components/PlannerApp'), {
  ssr: false,
  loading: () => (
    <div className="app-loading">
      <header className="app-header">
        <div>
          <h1>Waste operations</h1>
          <p>Route planning &amp; simulation</p>
        </div>
      </header>
      <p style={{ padding: '1.5rem', color: '#134e4a' }}>Loading planner…</p>
    </div>
  ),
});

export default function WasteOpsPage() {
  return <PlannerApp />;
}
