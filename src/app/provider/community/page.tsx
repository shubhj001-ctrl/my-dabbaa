import Link from "next/link";
import { MessagesSquare, UsersRound } from "lucide-react";
import { getProviderActivationMemberships } from "@/services/marketplace/activation-queries";

export default async function ProviderCommunityPage() {
  const result = await getProviderActivationMemberships();

  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">YOUR PRIVATE COMMUNITY</p>
        <h1>Give your kitchen regulars a place to connect.</h1>
        <p>Private community tools are not enabled yet. An activation does not create a group or send invitations.</p>
      </header>
      <section className="provider-dashboard-panel flex items-start gap-4">
        <span className="provider-metric-icon metric-lavender"><MessagesSquare size={19} /></span>
        <div>
          <h2 className="text-lg font-black">Community messaging is coming later.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">There are no posts, group chats, or invitations to manage on this page today. Continue coordinating meals directly with customers.</p>
        </div>
      </section>
      {result.status === "error" ? (
        <section className="provider-empty-card"><h2>We couldn’t load your activated customer count.</h2><p>Please refresh and try again.</p></section>
      ) : (
        <section className="provider-dashboard-panel">
          <p className="section-kicker">ELIGIBLE CUSTOMER CONNECTIONS</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3"><span className="provider-metric-icon metric-lime"><UsersRound size={18} /></span><p className="text-sm"><b>{result.memberships.length}</b> activated {result.memberships.length === 1 ? "customer" : "customers"}</p></div>
            <Link href="/provider/customers" className="text-sm font-bold text-primary underline underline-offset-4">View customers</Link>
          </div>
        </section>
      )}
    </div>
  );
}
