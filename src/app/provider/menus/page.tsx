import Link from "next/link";
import { MenusManager } from "@/components/provider/menus-manager";
import { getProviderKitchenData } from "@/services/marketplace/provider-queries";

export default async function ProviderMenusPage() {
  const result = await getProviderKitchenData();
  if (result.status !== "live") return <section className="provider-empty-card"><h1>{result.status === "unconfigured" ? "Connect Supabase to manage menus." : "We couldn't load your menus."}</h1><p>Apply the Stage 2 migration and try again.</p></section>;
  if (!result.data) return <section className="provider-empty-card"><span className="provider-empty-icon">✳</span><h1>Create your kitchen first.</h1><p>Daily menus show up on your public kitchen profile after approval.</p><Link className="form-primary" href="/provider/kitchen/new">Register a kitchen</Link></section>;
  return (
    <div className="provider-page space-y-6">
      <header className="provider-page-heading"><p className="section-kicker">DAILY MENU · {result.data.kitchen.kitchen_name}</p><h1>Make today delicious.</h1><p>Publish the meals you&apos;re cooking, then keep upcoming and previous menus tidy.</p></header>
      <MenusManager menus={result.data.menus} />
    </div>
  );
}
