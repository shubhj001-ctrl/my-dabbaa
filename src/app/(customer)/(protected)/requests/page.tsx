import { InAppNotifications } from "@/components/marketplace/in-app-notifications";
import { CustomerRequestsList } from "@/components/marketplace/customer-requests-list";
import { getCustomerRequests } from "@/services/marketplace/request-queries";

export default async function RequestsPage() {
  const result = await getCustomerRequests();
  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">YOUR KITCHEN REQUESTS</p>
        <h1>Keep every conversation in one place.</h1>
        <p>Follow your enquiries here. An accepted request still awaits activation; no food payment or subscription is created on My Dabbaa.</p>
      </header>
      {result.status === "unconfigured" ? (
        <RequestEmpty title="Connect Supabase to see your requests." />
      ) : result.status === "error" ? (
        <RequestEmpty title="Your requests aren't loading right now." description="Check the Stage 3 migration and try again." />
      ) : (
        <>
          <InAppNotifications notifications={result.notifications} />
          <CustomerRequestsList requests={result.requests} />
        </>
      )}
    </div>
  );
}

function RequestEmpty({ title, description = "Request data is not available in this environment." }: { title: string; description?: string }) {
  return <section className="provider-empty-card"><span className="provider-empty-icon">!</span><h2>{title}</h2><p>{description}</p></section>;
}
