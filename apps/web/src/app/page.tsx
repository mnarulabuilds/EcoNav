import dynamic from 'next/dynamic';

const PlannerApp = dynamic(() => import('@/components/PlannerApp'), {
  ssr: false,
  loading: () => (
    <div className="app-loading">
      <header className="app-header">
        <div>
          <h1>EcoNav</h1>
          <p>Smart City Waste Disposal Route Planner</p>
        </div>
      </header>
      <p style={{ padding: '1.5rem', color: '#134e4a' }}>Loading planner…</p>
    </div>
  ),
});

export default function HomePage() {
  return <PlannerApp />;
}
