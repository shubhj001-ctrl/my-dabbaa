export function PriceDisplay({
  amount,
  suffix = "meal",
  className = "",
}: {
  amount: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className="font-semibold text-foreground">
        ₹{amount.toLocaleString("en-IN")}
      </span>
      <span className="text-xs text-muted-foreground">/{suffix}</span>
    </span>
  );
}
