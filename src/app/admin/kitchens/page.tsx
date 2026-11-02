import { KitchenReviewQueue } from "@/components/admin/kitchen-review-queue";
import { getKitchenApplications } from "@/services/marketplace/admin-queries";

export default async function AdminKitchensPage() {
  const result = await getKitchenApplications();
  return (
    <div className="provider-page space-y-6">
      <header className="provider-page-heading">
        <p className="section-kicker">KITCHEN DIRECTORY</p>
        <h1>Give good kitchens the green light.</h1>
        <p>Review applications, preview photos, and manage live listings. Registration and listing remain free.</p>
      </header>
      {result.status === "unconfigured" ? (
        <AdminEmpty title="Connect Supabase to review applications." />
      ) : result.status === "error" ? (
        <AdminEmpty title="We couldn't load kitchen applications." description="Check the Stage 2 migration and try again." />
      ) : result.data.length ? (
        <KitchenReviewQueue applications={result.data} />
      ) : (
        <AdminEmpty title="No kitchens need a review yet." description="New provider applications will appear here." />
      )}
    </div>
  );
}

function AdminEmpty({ title, description = "Supabase data is not available in this environment." }: { title: string; description?: string }) {
  return <section className="provider-empty-card"><span className="provider-empty-icon">✳</span><h2>{title}</h2><p>{description}</p></section>;
}
