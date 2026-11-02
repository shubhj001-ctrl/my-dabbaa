import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KitchenOnboardingForm } from "@/components/provider/kitchen-onboarding-form";

export default function NewProviderKitchenPage() {
  return (
    <div className="provider-page space-y-6">
      <Link href="/provider/kitchen" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Kitchen home
      </Link>
      <header className="provider-page-heading">
        <p className="section-kicker">FREE LISTING · CHANDIGARH</p>
        <h1>Put your kitchen on the map.</h1>
        <p>Give local food people the details they need to find their next favourite.</p>
      </header>
      <section className="provider-form-card">
        <KitchenOnboardingForm />
      </section>
    </div>
  );
}
