import Link from "next/link";
import { CalendarDays, UsersRound } from "lucide-react";
import { getProviderActivationMemberships } from "@/services/marketplace/activation-queries";

export default async function ProviderSubscriptionsPage() {
  const result = await getProviderActivationMemberships();

  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">SUBSCRIPTION OVERVIEW</p>
        <h1>Keep your meal routines organised.</h1>
        <p>My Dabbaa doesn’t create, manage, or collect payment for food subscriptions. Coordinate meal plans, delivery, and recurring payments directly with your customers.</p>
      </header>
      <section className="rounded-2xl border border-[#e6cf8e] bg-[#fff7df] p-4 text-sm leading-6 text-[#51421e]">
        Activated customers below are kitchen connections—not tracked subscriptions. No renewal dates or subscription payment status are stored on this platform.
      </section>
      {result.status === "error" ? (
        <section className="provider-empty-card"><h2>We couldn’t load activated customers.</h2><p>Please refresh and try again.</p></section>
      ) : result.memberships.length ? (
        <section className="provider-dashboard-panel flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="provider-metric-icon metric-lime"><UsersRound size={18} /></span>
            <div>
              <p className="section-kicker">CUSTOMER CONNECTIONS</p>
              <h2 className="mt-1 text-xl font-black">{result.memberships.length} activated {result.memberships.length === 1 ? "customer" : "customers"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Meal plans and recurring payments remain your direct arrangement with each customer.</p>
            </div>
          </div>
          <Link href="/provider/customers" className="text-sm font-bold text-primary underline underline-offset-4">View authorized customer details</Link>
        </section>
      ) : (
        <section className="provider-empty-card"><span className="provider-empty-icon"><CalendarDays size={20} /></span><h2>No activated customers yet.</h2><p>After a successful activation, customer connections will appear here. You can define informational meal plans now.</p><Link className="form-primary mt-4" href="/provider/plans">Manage meal plans</Link></section>
      )}
    </div>
  );
}
