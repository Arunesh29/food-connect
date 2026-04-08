export default function SkeletonCard({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card" style={{ animation: `fadeIn 0.3s ${i * 0.1}s ease both` }}>
          <div className="skeleton skeleton-image" />
          <div className="skeleton-body">
            <div className="skeleton skeleton-text lg" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text sm" />
            <div style={{ height: '36px', marginTop: '8px' }} className="skeleton" />
          </div>
        </div>
      ))}
    </>
  );
}
