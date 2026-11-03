import Link from "next/link";
import { CalendarDays, ExternalLink } from "lucide-react";
import { getCustomerActivatedKitchens } from "@/services/marketplace/activation-queries";

export default async function SubscriptionsPage() {
  const result = await getCustomerActivatedKitchens();

  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">YOUR MEAL ROUTINE</p>
        <h1>Subscriptions that fit your week.</h1>
        <p>Activation connects you with a kitchen. You arrange the food plan, delivery, and payments directly with the provider.</p>
      </header>
      <section className="rounded-2xl border border-[#e6cf8e] bg-[#fff7df] p-4 text-sm leading-6 text-[#51421e]">
        My Dabbaa doesn’t record or process your food subscription or meal payments. This page shows kitchens where your profile has been activated, not a confirmed meal subscription.
      </section>
      {result.status === "error" ? (
        <section className="provider-empty-card"><h2>We couldn’t load your kitchen connections.</h2><p>Please refresh and try again.</p></section>
      ) : result.memberships.length ? (
        <section className="space-y-3" aria-label="Activated kitchen connections">
          {result.memberships.map((membership) => (
            <article key={membership.id} className="provider-dashboard-panel flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="provider-metric-icon metric-lime"><CalendarDays size={18} /></span>
                <div>
                  <p className="section-kicker">ACTIVATED KITCHEN</p>
                  <h2 className="mt-1 text-lg font-black">{membership.kitchen_name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Connected {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(membership.activated_at))}
                  </p>
                </div>
              </div>
              <span className="kitchen-status status-draft">Meal plan arranged directly</span>
            </article>
          ))}
        </section>
      ) : (
        <section className="provider-empty-card">
          <span className="provider-empty-icon"><CalendarDays size={20} /></span>
          <h2>No activated kitchen connections yet.</h2>
          <p>When a kitchen confirms your request with a verified activation, it will appear here. You can then arrange a meal subscription with them directly.</p>
          <Link className="form-primary mt-4" href="/requests"><ExternalLink size={15} /> View your requests</Link>
        </section>
      )}
      <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-bold text-primary underline underline-offset-4">Explore kitchens</Link>
    </div>
  );
}
