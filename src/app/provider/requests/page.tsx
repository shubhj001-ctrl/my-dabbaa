import { InAppNotifications } from "@/components/marketplace/in-app-notifications";
import { ProviderRequestsList } from "@/components/provider/provider-requests-list";
import { getProviderRequests } from "@/services/marketplace/request-queries";

export default async function ProviderRequestsPage() {
  const result = await getProviderRequests();
  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">CUSTOMER REQUESTS</p>
        <h1>Good things start with a hello.</h1>
        <p>Review enquiries for kitchens you own. Customer phone numbers and emails stay private; accepting is free and the request will await activation.</p>
      </header>
      {result.status === "unconfigured" ? (
        <RequestEmpty title="Connect Supabase to manage requests." />
      ) : result.status === "error" ? (
        <RequestEmpty title="We couldn't load incoming requests." description="Check the Stage 3 migration and try again." />
      ) : (
        <>
          <InAppNotifications notifications={result.notifications} />
          <ProviderRequestsList
            key={result.requests
              .map((request) => `${request.id}:${request.status}:${request.activated_at ?? ""}:${request.contact_sharing_consent}`)
              .join("|")}
            requests={result.requests}
          />
        </>
      )}
    </div>
  );
}

function RequestEmpty({ title, description = "Request data is not available in this environment." }: { title: string; description?: string }) {
  return <section className="provider-empty-card"><span className="provider-empty-icon">!</span><h2>{title}</h2><p>{description}</p></section>;
}
