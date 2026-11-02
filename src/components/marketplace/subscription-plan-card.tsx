import { Check } from "lucide-react";
import type { SubscriptionPlan } from "@/types/marketplace";

export function SubscriptionPlanCard({
  plan,
  onChoose,
}: {
  plan: SubscriptionPlan;
  onChoose?: (plan: SubscriptionPlan) => void;
}) {
  const content = (
    <>
      {plan.popular ? (
        <span className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Most popular
        </span>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
        {plan.duration}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-foreground">{plan.name}</h3>
      <p className="mt-2 min-h-10 text-sm leading-5 text-muted-foreground">
        {plan.description}
      </p>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
        ₹{plan.price.toLocaleString("en-IN")}
        <span className="ml-1 text-xs font-normal text-muted-foreground">
          /plan
        </span>
      </p>
      <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Check aria-hidden="true" size={14} className="text-primary" />
        {plan.mealsPerWeek} meals per week
      </p>
    </>
  );

  return (
    <article
      className={`plan-card relative rounded-2xl border p-5 ${
        plan.popular
          ? "border-primary/40 bg-[#f4f7f0] shadow-[0_10px_28px_rgb(31_54_42/8%)]"
          : "border-border bg-card"
      }`}
    >
      {content}
      {onChoose ? (
        <button
          type="button"
          onClick={() => onChoose(plan)}
          className="mt-5 min-h-10 w-full rounded-full border border-primary/25 bg-white px-4 text-sm font-semibold text-primary transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Choose this plan
        </button>
      ) : null}
    </article>
  );
}
