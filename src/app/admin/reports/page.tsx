import Link from "next/link";
import { CreditCard, FileText, Store, UsersRound } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { getAdminDashboard } from "@/services/marketplace/admin-queries";

export default async function AdminReportsPage() {
  const result = await getAdminDashboard();

  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">PLATFORM REPORTS</p>
        <h1>Learn from a healthier marketplace.</h1>
        <p>Operational totals from the marketplace database. These are lifetime counts, not date-filtered analytics.</p>
      </header>
      {result.status !== "live" ? (
        <section className="provider-empty-card">
          <h2>{result.status === "unconfigured" ? "Connect the production database to view reports." : "We couldn’t load the platform report."}</h2>
          <p>{result.status === "error" ? "Check that the admin metrics migration is applied and your administrator account is active." : "Reports are generated only from connected platform data."}</p>
        </section>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform report totals">
            <AdminMetricCard label="Customer accounts" value={result.data.customers} detail="Registered customer profiles" icon={<UsersRound size={18} />} />
            <AdminMetricCard label="Provider accounts" value={result.data.providers} detail="Registered kitchen providers" icon={<UsersRound size={18} />} />
            <AdminMetricCard label="Listed kitchens" value={result.data.kitchens} detail={`${result.data.kitchensPendingReview} awaiting review`} icon={<Store size={18} />} />
            <AdminMetricCard label="Customer requests" value={result.data.requests} detail={`${result.data.requestsPending} pending response`} icon={<FileText size={18} />} />
          </section>
          <section className="provider-dashboard-panel">
            <p className="section-kicker">VERIFIED PLATFORM FEES</p>
            <h2 className="mt-1 text-xl font-black">Activation activity</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <AdminMetricCard label="Applied activations" value={result.data.verifiedActivations} detail="Only captured and applied activation records" icon={<CreditCard size={18} />} />
              <AdminMetricCard label="Activation fee total" value={`₹${(result.data.activationRevenuePaise / 100).toLocaleString("en-IN")}`} detail="Provider-paid ₹199 fee; excludes all food payments" icon={<CreditCard size={18} />} />
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">Reports containing review ratings, food subscription revenue, delivery performance, or customer-level behavioral data are not available because those features are not tracked by the platform.</p>
          </section>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/payments" className="text-sm font-bold text-primary underline underline-offset-4">Review payment ledger</Link>
            <Link href="/admin/kitchens" className="text-sm font-bold text-primary underline underline-offset-4">Review kitchen applications</Link>
          </div>
        </>
      )}
    </div>
  );
}
