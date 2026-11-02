import Link from "next/link";
import { ArrowRight, BadgeCheck, CircleAlert, Plus } from "lucide-react";
import { KitchenOnboardingForm } from "@/components/provider/kitchen-onboarding-form";
import { getProviderKitchenData } from "@/services/marketplace/provider-queries";

export default async function ProviderKitchenPage({
  searchParams,
}: PageProps<"/provider/kitchen">) {
  const { submitted } = await searchParams;
  const result = await getProviderKitchenData();
  if (result.status === "unconfigured") {
    return <DataMessage title="Kitchen listings need a Supabase connection." description="Add your project URL and public anon key to enable provider listings." />;
  }
  if (result.status === "error") {
    return <DataMessage title="We couldn't load your kitchen." description="Check that the Stage 2 migration is applied and try again." />;
  }

  const data = result.data;
  if (!data) {
    return (
      <div className="provider-page space-y-6">
        <header className="provider-page-heading">
          <p className="section-kicker">YOUR PUBLIC LISTING</p>
          <h1>Let&apos;s get your kitchen out there.</h1>
          <p>Create a free kitchen listing. It&apos;ll be reviewed before it goes public.</p>
        </header>
        <section className="provider-empty-card">
          <span className="provider-empty-icon">✳</span>
          <h2>Nothing cooking here yet.</h2>
          <p>Your kitchen page is just a few good details away.</p>
          <Link className="form-primary" href="/provider/kitchen/new">Start kitchen registration <ArrowRight size={16} /></Link>
        </section>
      </div>
    );
  }

  const statusText = data.kitchen.approval_status;
  return (
    <div className="provider-page space-y-6">
      <header className="provider-page-heading">
        <p className="section-kicker">YOUR PUBLIC LISTING</p>
        <h1>{data.kitchen.kitchen_name}</h1>
        <p>Keep your kitchen details, service areas, and photos up to date.</p>
      </header>
      {submitted === "1" ? (
        <div className="provider-status-banner provider-status-pending" role="status"><BadgeCheck size={19} /> Your kitchen is in the review queue. We&apos;ll let you know when it&apos;s live.</div>
      ) : null}
      <section className="provider-status-card">
        <div>
          <span className={`kitchen-status status-${statusText}`}>{statusText}</span>
          <h2 className="mt-3">{statusText === "approved" ? "You're on the map." : statusText === "pending" ? "The team is checking things out." : statusText === "suspended" ? "Your listing is paused." : statusText === "rejected" ? "A quick update needed." : "Your draft is ready to finish."}</h2>
          <p>{data.kitchen.is_listed ? "Your approved listing is visible to customers in Explore." : "Only you can see this listing until it is approved."}</p>
          {data.kitchen.rejection_reason ? <p className="mt-2 text-sm font-semibold">Review note: {data.kitchen.rejection_reason}</p> : null}
        </div>
        <CircleAlert aria-hidden="true" size={23} />
      </section>
      <section className="provider-form-card">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div><h2 className="text-xl font-black">Kitchen details</h2><p className="mt-1 text-sm text-muted-foreground">Changes to your public listing go back through review.</p></div>
          <Link className="provider-add-link" href="/provider/kitchen/new"><Plus size={16} /> Add another</Link>
        </div>
        <KitchenOnboardingForm initial={data} />
      </section>
    </div>
  );
}

function DataMessage({ title, description }: { title: string; description: string }) {
  return <section className="provider-empty-card"><span className="provider-empty-icon">!</span><h1>{title}</h1><p>{description}</p></section>;
}
