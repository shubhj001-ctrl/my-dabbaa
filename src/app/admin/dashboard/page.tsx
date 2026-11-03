import Link from "next/link";
import { CreditCard, FileText, Store, UsersRound } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { getAdminDashboard } from "@/services/marketplace/admin-queries";

export default async function AdminDashboardPage() {
  const result = await getAdminDashboard();

  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">MARKETPLACE OVERVIEW</p>
        <h1>A clear view of the marketplace.</h1>
        <p>Current platform activity and verified My Dabbaa activation fees. Food subscription payments are not processed here.</p>
      </header>
      {result.status !== "live" ? (
        <section className="provider-empty-card">
          <h2>{result.status === "unconfigured" ? "Connect the production database to view platform metrics." : "We couldn’t load the marketplace overview."}</h2>
          <p>{result.status === "error" ? "Check that the admin metrics migration has been applied and that your administrator account is active." : "Metrics are only displayed from the connected database."}</p>
        </section>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Marketplace metrics">
            <AdminMetricCard label="Customers" value={result.data.customers} detail="Registered customer accounts" icon={<UsersRound size={18} />} />
            <AdminMetricCard label="Providers" value={result.data.providers} detail="Registered provider accounts" icon={<UsersRound size={18} />} />
            <AdminMetricCard label="Listed kitchens" value={result.data.kitchens} detail={`${result.data.kitchensPendingReview} awaiting review`} icon={<Store size={18} />} />
            <AdminMetricCard label="Customer requests" value={result.data.requests} detail={`${result.data.requestsPending} awaiting provider response`} icon={<FileText size={18} />} />
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <AdminMetricCard label="Verified activations" value={result.data.verifiedActivations} detail="Captured fees applied to customer activation" icon={<CreditCard size={18} />} />
            <AdminMetricCard label="Activation fee total" value={`₹${(result.data.activationRevenuePaise / 100).toLocaleString("en-IN")}`} detail="Verified ₹199 platform fees only" icon={<CreditCard size={18} />} />
          </section>
          <section className="provider-dashboard-panel">
            <p className="section-kicker">OPERATIONS</p>
            <h2 className="mt-1 text-xl font-black">What needs attention</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/admin/kitchens" className="rounded-xl border border-border p-4 transition-colors hover:bg-white">
                <span className="kitchen-status status-pending">{result.data.kitchensPendingReview} pending</span>
                <p className="mt-2 font-bold">Kitchen reviews</p>
                <p className="mt-1 text-sm text-muted-foreground">Review listings before they appear publicly.</p>
              </Link>
              <Link href="/admin/payments" className="rounded-xl border border-border p-4 transition-colors hover:bg-white">
                <span className="kitchen-status status-neutral">{result.data.verifiedActivations} verified</span>
                <p className="mt-2 font-bold">Activation payments</p>
                <p className="mt-1 text-sm text-muted-foreground">Review provider-paid activation records.</p>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
