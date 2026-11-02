import Link from "next/link";
import { PlansManager } from "@/components/provider/plans-manager";
import { getProviderKitchenData } from "@/services/marketplace/provider-queries";

export default async function ProviderPlansPage() {
  const result = await getProviderKitchenData();
  if (result.status !== "live") return <section className="provider-empty-card"><h1>{result.status === "unconfigured" ? "Connect Supabase to manage plans." : "We couldn't load your plans."}</h1><p>Apply the Stage 2 migration and try again.</p></section>;
  if (!result.data) return <section className="provider-empty-card"><span className="provider-empty-icon">₹</span><h1>Create your kitchen first.</h1><p>Meal plans belong to your kitchen listing.</p><Link className="form-primary" href="/provider/kitchen/new">Register a kitchen</Link></section>;
  return (
    <div className="provider-page space-y-6">
      <header className="provider-page-heading"><p className="section-kicker">MEAL PLANS · {result.data.kitchen.kitchen_name}</p><h1>Make the meal routine clear.</h1><p>Share your options and prices. Customers pay your kitchen directly.</p></header>
      <PlansManager plans={result.data.plans} />
    </div>
  );
}
