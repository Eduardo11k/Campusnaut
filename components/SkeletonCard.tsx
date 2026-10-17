export default function SkeletonCard() {
  return (
    <div className="border-2 border-ink bg-cream-50 p-4 shadow-poster sm:p-5">
      <div className="mb-3 flex gap-2">
        <div className="h-5 w-16 animate-pulse rounded-full bg-cream-200" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-cream-200" />
      </div>
      <div className="h-6 w-3/4 animate-pulse rounded bg-cream-200" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-cream-200" />
      <div className="mt-6 h-3 w-full animate-pulse rounded bg-cream-200" />
      <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-cream-200" />
      <div className="mt-2 h-3 w-4/6 animate-pulse rounded bg-cream-200" />
      <div className="mt-6 flex items-center justify-between border-t-2 border-ink/10 pt-4">
        <div className="h-6 w-12 animate-pulse rounded bg-cream-200" />
        <div className="h-10 w-28 animate-pulse rounded bg-cream-200" />
      </div>
    </div>
  );
}
