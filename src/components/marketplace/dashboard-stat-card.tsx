import type { LucideIcon } from "lucide-react";

export function DashboardStatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "sage",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "sage" | "cream" | "lavender" | "peach";
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <span className={`stat-icon stat-icon-${tone}`}>
          <Icon aria-hidden="true" size={19} />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{detail}</p>
    </article>
  );
}
