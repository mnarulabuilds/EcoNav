export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="page-loader" role="status" aria-busy="true">
      <div className="page-loader-spinner" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
