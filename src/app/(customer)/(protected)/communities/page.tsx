import Link from "next/link";
import { MessagesSquare, UsersRound } from "lucide-react";
import { getCustomerActivatedKitchens } from "@/services/marketplace/activation-queries";

export default async function CommunitiesPage() {
  const result = await getCustomerActivatedKitchens();

  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">KITCHEN COMMUNITIES</p>
        <h1>A little more connected to your kitchen.</h1>
        <p>Community access is reserved for activated customers. We’ll show your eligible kitchens here as community features are introduced.</p>
      </header>
      <section className="provider-dashboard-panel flex items-start gap-4">
        <span className="provider-metric-icon metric-lavender"><MessagesSquare size={19} /></span>
        <div>
          <h2 className="text-lg font-black">Community conversations aren’t available yet.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">No group, message, or invitation has been created. Your activation does not automatically add you to a chat.</p>
        </div>
      </section>
      {result.status === "error" ? (
        <section className="provider-empty-card"><h2>We couldn’t load your eligible kitchens.</h2><p>Please refresh and try again.</p></section>
      ) : result.memberships.length ? (
        <section className="provider-dashboard-panel">
          <p className="section-kicker">ACTIVATED KITCHENS</p>
          <h2 className="mt-1 text-xl font-black">Your kitchen connections</h2>
          <ul className="mt-4 divide-y divide-border">
            {result.memberships.map((membership) => (
              <li key={membership.id} className="flex items-center gap-3 py-3">
                <UsersRound size={17} className="text-primary" />
                <span className="font-semibold">{membership.kitchen_name}</span>
                <span className="ml-auto text-xs text-muted-foreground">Activated</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="provider-empty-card"><h2>No activated kitchen connections yet.</h2><p>After a kitchen verifies your activation, the connection will appear here.</p><Link className="form-primary mt-4" href="/explore">Explore kitchens</Link></section>
      )}
    </div>
  );
}
