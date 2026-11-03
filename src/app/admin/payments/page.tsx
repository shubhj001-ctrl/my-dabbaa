import { CreditCard, IndianRupee, TriangleAlert } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPaymentHistory } from "@/components/admin/admin-payment-history";
import { getAdminActivationPayments } from "@/services/marketplace/admin-queries";

export default async function AdminPaymentsPage() {
  const result = await getAdminActivationPayments();
  const applied = result.status === "live"
    ? result.data.filter((payment) => payment.status === "success" && payment.activation_applied)
    : [];
  const needsReview = result.status === "live"
    ? result.data.filter((payment) => payment.status === "success" && !payment.activation_applied)
    : [];
  const pending = result.status === "live"
    ? result.data.filter((payment) => payment.status === "created" || payment.status === "pending")
    : [];
  const appliedPaise = applied.reduce((sum, payment) => sum + payment.amount_paise, 0);

  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">ACTIVATION PAYMENTS</p>
        <h1>Keep platform activation fees transparent.</h1>
        <p>Review the one-time ₹199 provider activation fee. Food subscription payments are never processed by My Dabbaa.</p>
      </header>
      {result.status !== "live" ? (
        <section className="provider-empty-card">
          <h2>{result.status === "unconfigured" ? "Connect the production database to view payments." : "We couldn’t load activation payments."}</h2>
          <p>{result.status === "error" ? "Apply the admin activation-payment read migration and confirm your account has trusted administrator access." : "Payment history is only available from the connected database."}</p>
        </section>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AdminMetricCard label="Applied activations" value={applied.length} detail="Within the latest 250 attempts" icon={<CreditCard size={18} />} />
            <AdminMetricCard label="Verified fee total" value={`₹${(appliedPaise / 100).toLocaleString("en-IN")}`} detail="Latest 250 attempts · activation fees only" icon={<IndianRupee size={18} />} />
            <AdminMetricCard label="Pending / review" value={pending.length + needsReview.length} detail={`${pending.length} pending · ${needsReview.length} captured needing review · latest 250`} icon={<TriangleAlert size={18} />} />
          </section>
          <AdminPaymentHistory payments={result.data} />
        </>
      )}
    </div>
  );
}
