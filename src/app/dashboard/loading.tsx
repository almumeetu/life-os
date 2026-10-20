export default function DashboardLoading() {
  return <div className="workspace-loading" role="status" aria-busy="true">
    <p>Loading your workspace… <span lang="bn">আপনার শেখার জায়গা খুলছে…</span></p>
    <div className="loading-line" />
    <div className="loading-hero" />
    <div className="loading-cards"><div /><div /><div /></div>
  </div>;
}
