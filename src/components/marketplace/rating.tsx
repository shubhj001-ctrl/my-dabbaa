import { Star } from "lucide-react";

export function Rating({
  value,
  count,
  compact = false,
}: {
  value: number;
  count?: number;
  compact?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm">
      <Star
        aria-hidden="true"
        size={15}
        fill="currentColor"
        className="text-[#d39b3e]"
      />
      <span className="font-semibold text-foreground">{value.toFixed(1)}</span>
      {typeof count === "number" ? (
        <span className="text-muted-foreground">
          {compact ? `(${count})` : `${count} reviews`}
        </span>
      ) : null}
    </span>
  );
}
