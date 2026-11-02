import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Compass,
  FileText,
  MapPin,
  Sparkles,
} from "lucide-react";
import { EmptyState } from "@/components/marketplace/empty-state";
import { KitchenCard } from "@/components/marketplace/kitchen-card";
import { demoCustomer, demoSubscriptions, featuredKitchens, kitchens } from "@/data/mock-data/kitchens";

export default function HomePage() {
  const subscription = demoSubscriptions[0];

  return (
    <div className="space-y-9">
      <section className="customer-dashboard-hero relative overflow-hidden rounded-[1.5rem] p-6 text-white sm:p-9 lg:p-10">
        <div className="relative z-10 max-w-2xl">
          <span className="eyebrow-pill border-white/25 bg-white/10 text-white">
            <Sparkles aria-hidden="true" size={14} />
            {demoCustomer.demoLabel} · sample data
          </span>
          <h1 className="mt-5 font-serif text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            Good afternoon, {demoCustomer.firstName}.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
            There’s something lovely about a lunch that feels like home. Let’s
            find yours nearby.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-primary transition-colors hover:bg-[#eff3ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Explore kitchens
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="absolute -bottom-16 -right-10 hidden size-72 rounded-full border border-white/15 lg:block" aria-hidden="true" />
        <div className="absolute -bottom-5 -right-5 hidden size-52 rounded-full border border-white/15 lg:block" aria-hidden="true" />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" size={16} className="text-primary" />
          Around {demoCustomer.neighbourhood}
        </p>
        <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
          All dashboard details are demo data
        </span>
      </div>

      <section aria-labelledby="customer-shortcuts">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Your table</p>
            <h2 id="customer-shortcuts" className="mt-1 text-xl font-semibold text-foreground">
              A few helpful shortcuts
            </h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Explore kitchens", href: "/explore", icon: Compass, detail: "Find a fresh favourite" },
            { label: "My requests", href: "/requests", icon: FileText, detail: "See your conversations" },
            { label: "Subscriptions", href: "/subscriptions", icon: CalendarDays, detail: "Your meal routine" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/25 hover:bg-[#fcfcf7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon aria-hidden="true" size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{item.detail}</span>
                  </span>
                </span>
                <ArrowRight aria-hidden="true" size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="recommended-heading">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Picked for your neighbourhood</p>
            <h2 id="recommended-heading" className="section-title text-2xl">
              Kitchens worth getting to know.
            </h2>
          </div>
          <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            See all
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {featuredKitchens.slice(0, 3).map((kitchen) => (
            <KitchenCard key={kitchen.id} kitchen={kitchen} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-4">
            <p className="section-kicker">Your meal routine</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              Active subscription
            </h2>
          </div>
          {subscription ? (
            <article className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary">
                    Demo · {subscription.status}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">
                    {subscription.kitchenName}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {subscription.planName}
                  </p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#f7f1e4] text-[#927238]">
                  <CalendarDays aria-hidden="true" size={18} />
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Meals remaining</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{subscription.mealsRemaining}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Renewal in</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{subscription.expiresInDays} days</p>
                </div>
              </div>
              <Link href="/subscriptions" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                View subscription
                <ArrowRight aria-hidden="true" size={14} />
              </Link>
            </article>
          ) : (
            <EmptyState title="No subscriptions yet" description="Your meal plans will appear here once you get started with a kitchen." action={{ href: "/explore", label: "Explore kitchens" }} />
          )}
        </div>

        <div>
          <div className="mb-4">
            <p className="section-kicker">A little follow-up</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              Pending requests
            </h2>
          </div>
          <EmptyState
            title="Nothing waiting right now"
            description="When you reach out to a kitchen, your request updates will be easy to find here."
            action={{ href: "/explore", label: "Meet a kitchen" }}
          />
        </div>
      </section>

      <section aria-labelledby="recently-viewed-heading">
        <div className="section-heading">
          <div>
            <p className="section-kicker">A little more inspiration</p>
            <h2 id="recently-viewed-heading" className="mt-1 text-xl font-semibold text-foreground">
              Recently viewed kitchens
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">Demo browsing history</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {kitchens.slice(3, 5).map((kitchen) => (
            <Link
              key={kitchen.id}
              href={`/kitchens/${kitchen.id}`}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 hover:border-primary/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
                <Clock3 aria-hidden="true" size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{kitchen.name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{kitchen.sector} · viewed recently (demo)</span>
              </span>
              <ArrowRight aria-hidden="true" size={16} className="text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
