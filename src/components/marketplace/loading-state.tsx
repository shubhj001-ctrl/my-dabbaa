export function LoadingState({
  label = "Loading kitchens",
}: {
  label?: string;
}) {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label={label}
    >
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-[1.25rem] border border-border bg-card"
        >
          <div className="skeleton-shimmer aspect-[1.55]" />
          <div className="space-y-3 p-5">
            <div className="skeleton-shimmer h-5 w-2/3 rounded-md" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
            <div className="skeleton-shimmer h-4 w-full rounded-md" />
            <div className="skeleton-shimmer h-9 w-full rounded-full" />
          </div>
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
