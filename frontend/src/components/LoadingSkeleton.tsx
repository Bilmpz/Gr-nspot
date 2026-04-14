export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-52 rounded-2xl" style={{ background: '#F3F4F6' }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-10 rounded-xl"
          style={{ background: '#F3F4F6', opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}
