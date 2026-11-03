import Link from "next/link";
import { MessageSquareText, ShieldCheck } from "lucide-react";

export default function AdminReviewsPage() {
  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">REVIEWS & TRUST</p>
        <h1>Make room for honest, helpful feedback.</h1>
        <p>Reviews have not been launched. No review records or moderation actions are available yet.</p>
      </header>
      <section className="provider-dashboard-panel flex items-start gap-4">
        <span className="provider-metric-icon metric-lavender"><MessageSquareText size={19} /></span>
        <div>
          <h2 className="text-lg font-black">There are no reviews to moderate.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">A review feature needs clear eligibility, customer privacy, moderation, and appeal rules before ratings can affect a kitchen’s public listing. This page does not create sample or assumed reviews.</p>
        </div>
      </section>
      <section className="provider-dashboard-panel">
        <div className="flex items-start gap-3"><ShieldCheck size={19} className="mt-0.5 text-primary" /><div><h2 className="font-black">Existing trust workflow</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Kitchen applications are reviewed before public listing. Manage that workflow from the kitchen directory.</p><Link className="mt-3 inline-flex text-sm font-bold text-primary underline underline-offset-4" href="/admin/kitchens">Open kitchen reviews</Link></div></div>
      </section>
    </div>
  );
}
