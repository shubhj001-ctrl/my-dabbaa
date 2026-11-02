import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  MapPin,
  Plus,
  Store,
  Utensils,
} from "lucide-react";
import { getProviderKitchenData } from "@/services/marketplace/provider-queries";

export default async function ProviderDashboardPage() {
  const result = await getProviderKitchenData();
  if (result.status !== "live") {
    return (
      <div className="provider-page space-y-6">
        <header className="provider-page-heading"><p className="section-kicker">YOUR KITCHEN HQ</p><h1>Your kitchen, your rules.</h1><p>Keep your public listing, plans, and menus fresh from one place.</p></header>
        <section className="provider-empty-card"><span className="provider-empty-icon">!</span><h2>{result.status === "unconfigured" ? "Connect your Supabase project." : "We couldn't load your kitchen data."}</h2><p>{result.status === "unconfigured" ? "Add the Supabase project URL and public anon key to enable provider tools." : "Check that the Stage 2 migration is applied and retry."}</p></section>
      </div>
    );
  }
  if (!result.data) {
    return (
      <div className="provider-page space-y-6">
        <header className="provider-page-heading"><p className="section-kicker">YOUR KITCHEN HQ</p><h1>Good food deserves a home page.</h1><p>Register your free kitchen listing to start showing up for Chandigarh food people.</p></header>
        <section className="provider-empty-card"><span className="provider-empty-icon">✳</span><h2>Nothing cooking here yet.</h2><p>Your kitchen listing is free, and it only takes a few minutes to get started.</p><Link className="form-primary" href="/provider/kitchen/new"><Plus size={16} /> Register your kitchen</Link></section>
      </div>
    );
  }

  const { kitchen, plans, menus, serviceAreas } = result.data;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const todayMenus = menus.filter((menu) => menu.menu_date === today);
  const completenessItems = [
    kitchen.kitchen_name,
    kitchen.description,
    kitchen.address,
    kitchen.contact_phone,
    kitchen.cuisine_types.length,
    kitchen.meal_categories.length,
    serviceAreas.length,
    result.data.photos.length,
  ];
  const completion = Math.round(completenessItems.filter(Boolean).length / completenessItems.length * 100);
  const statusDescription: Record<string, string> = {
    draft: "Finish your application and send it for review.",
    pending: "Your listing is in the review queue. It isn't public yet.",
    approved: "Your kitchen is live and discoverable in Explore.",
    rejected: "Check the review note and update your listing.",
    suspended: "Your listing is paused and hidden from Explore.",
  };

  return (
    <div className="provider-page space-y-7">
      <section className="provider-dashboard-hero">
        <div>
          <span className="provider-hero-kicker">YOUR KITCHEN HQ · CHANDIGARH</span>
          <h1>Let&apos;s make today delicious.</h1>
          <p>Here&apos;s what&apos;s happening with {kitchen.kitchen_name}.</p>
        </div>
        <Link href="/provider/menus" className="button-pop button-lime"><Plus size={17} /> Add today&apos;s menu</Link>
        <span className={`kitchen-status status-${kitchen.approval_status}`}>{kitchen.approval_status}</span>
      </section>

      <section className="provider-status-card">
        <div>
          <div className="flex flex-wrap items-center gap-2"><Store size={17} /><h2>{kitchen.kitchen_name}</h2><span className={`kitchen-status status-${kitchen.approval_status}`}>{kitchen.approval_status}</span></div>
          <p className="mt-2">{statusDescription[kitchen.approval_status]}</p>
          <div className="mt-5 flex items-center justify-between text-xs"><b>Kitchen profile completeness</b><strong>{completion}%</strong></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eadff4]" role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100} aria-label="Kitchen profile completeness"><span className="block h-full rounded-full bg-[#c6ff3d]" style={{ width: `${completion}%` }} /></div>
        </div>
        <Link className="provider-small-button" href="/provider/kitchen"><Store size={14} /> Edit kitchen</Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="provider-metric-card"><span className="provider-metric-icon metric-lime"><ClipboardList size={19} /></span><p>Active plans</p><strong>{plans.filter((plan) => plan.is_active).length}</strong><small>Displayed to customers when listing is approved</small></article>
        <article className="provider-metric-card"><span className="provider-metric-icon metric-lavender"><Utensils size={19} /></span><p>Today&apos;s menus</p><strong>{todayMenus.length}</strong><small>{todayMenus.length ? "Posted for today" : "No menu posted yet"}</small></article>
        <article className="provider-metric-card"><span className="provider-metric-icon metric-butter"><MapPin size={19} /></span><p>Service sectors</p><strong>{serviceAreas.filter((area) => area.is_active).length}</strong><small>Chandigarh areas you cover</small></article>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="provider-dashboard-panel">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="section-kicker">TODAY’S SPECIAL</p><h2>On the menu</h2></div><Link href="/provider/menus" className="provider-small-button">All menus <ArrowRight size={14} /></Link></div>
          {todayMenus.length ? (
            <div className="mt-4 space-y-3">{todayMenus.map((menu) => <article className="provider-menu-preview" key={menu.id}><span className="kitchen-status status-approved">{menu.meal_type}</span><h3>{menu.title}</h3><p>{menu.description}</p></article>)}</div>
          ) : <div className="provider-inline-empty"><CalendarDays size={18} /><p>No menu posted for today. Give customers a peek at what you&apos;re cooking.</p><Link href="/provider/menus">Add a menu <ArrowRight size={14} /></Link></div>}
        </div>
        <div className="provider-dashboard-panel">
          <p className="section-kicker">YOUR NEIGHBOURHOOD</p><h2>Service areas</h2>
          <div className="mt-4 flex flex-wrap gap-2">{serviceAreas.filter((area) => area.is_active).map((area) => <span className="service-sector-chip" key={area.id}>{area.sector}</span>)}</div>
          {!serviceAreas.length ? <p className="mt-3 text-sm text-muted-foreground">Add the Chandigarh sectors where you deliver.</p> : null}
          <Link className="provider-small-button mt-5" href="/provider/kitchen">Manage areas <ArrowRight size={14} /></Link>
        </div>
      </section>

      <section>
        <div className="mb-4"><p className="section-kicker">YOUR NEXT MOVES</p><h2 className="mt-1 text-xl font-black">Quick actions</h2></div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Kitchen listing", href: "/provider/kitchen", icon: Store },
            { label: "Subscription plans", href: "/provider/plans", icon: ClipboardList },
            { label: "Daily menus", href: "/provider/menus", icon: Utensils },
          ].map((action) => {
            const ActionIcon = action.icon;
            return <Link key={action.href} href={action.href} className="provider-quick-action"><span><ActionIcon size={18} /></span><b>{action.label}</b><ArrowRight size={15} /></Link>;
          })}
        </div>
      </section>

      <p className="rounded-xl bg-[#fff2c8] px-4 py-3 text-xs leading-5 text-[#51421e]">Kitchen listings are free. Plans are informational only; meal payments and delivery are arranged directly between you and customers.</p>
    </div>
  );
}
