export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="skeleton aspect-[3/4] w-full bg-primary-100 mb-3" />
      <div className="skeleton h-4 w-3/4 bg-primary-100 mb-2" />
      <div className="skeleton h-4 w-1/3 bg-primary-100" />
    </div>
  );
}
