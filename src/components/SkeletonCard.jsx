export default function SkeletonCard({ count = 1 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="skeleton-card">
      <div className="skeleton" style={{ height: 220 }} />
      <div style={{ padding: 20 }}>
        <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
      </div>
    </div>
  ));
}
