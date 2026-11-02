import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  FileText,
  Plus,
  Store,
  UsersRound,
} from "lucide-react";
import { DashboardStatCard } from "@/components/marketplace/dashboard-stat-card";
import { PerformanceChart } from "@/components/marketplace/performance-chart";
import { demoActivities } from "@/data/mock-data/kitchens";

export default function ProviderDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <span className="rounded-full border border-[#dce7dc] bg-[#edf3e9] px-3 py-1 text-[11px] font-semibold text-primary">
            DEMO PROVIDER WORKSPACE
          </span>
          <h1 className="mt-4 font-serif text-3xl font-medium tracking-[-0.04em] text-foreground sm:text-4xl">
            Good morning, kitchen.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Here’s your kitchen’s sample activity at a glance.
          </p>
        </div>
        <Link
          href="/provider/menus"
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-[#173c30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:self-auto"
        >
          <Plus aria-hidden="true" size={16} />
          Update today&apos;s menu
        </Link>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Store aria-hidden="true" size={17} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Ghar Ka Swaad</h2>
              <span className="rounded-full bg-[#f5efe0] px-2.5 py-1 text-[10px] font-semibold text-[#8b6d2d]">
                Sample kitchen
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Your public kitchen profile is taking shape.
            </p>
          </div>
          <Link
            href="/provider/kitchen"
            className="inline-flex min-h-9 items-center gap-2 self-start rounded-full border border-border px-4 text-xs font-semibold text-foreground hover:bg-secondary sm:self-auto"
          >
            Complete profile
            <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Profile completeness</span>
            <span className="font-semibold text-primary">72% demo</span>
          </div>
          <div
            role="progressbar"
            aria-label="Demo kitchen profile completeness"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={72}
            className="h-2 overflow-hidden rounded-full bg-[#e9ede5]"
          >
            <span className="block h-full w-[72%] rounded-full bg-[#467356]" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Demo kitchen metrics">
        <DashboardStatCard
          label="Total customers"
          value="48"
          detail="Illustrative all-time total"
          icon={UsersRound}
          tone="sage"
        />
        <DashboardStatCard
          label="Active subscriptions"
          value="36"
          detail="Illustrative active plans"
          icon={CalendarClock}
          tone="cream"
        />
        <DashboardStatCard
          label="Pending requests"
          value="7"
          detail="Illustrative requests to review"
          icon={FileText}
          tone="lavender"
        />
        <DashboardStatCard
          label="Expiring this week"
          value="3"
          detail="Illustrative upcoming renewals"
          icon={CalendarClock}
          tone="peach"
        />
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.8fr)]">
        <PerformanceChart />
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
              <p className="mt-1 text-xs text-muted-foreground">All entries are fictional demo activity.</p>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-secondary-foreground">DEMO</span>
          </div>
          <div className="mt-4 divide-y divide-border">
            {demoActivities.map((activity) => (
              <article key={activity.id} className="flex items-center gap-3 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-primary">
                  {activity.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">{activity.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{activity.detail}</p>
                </div>
              </article>
            ))}
          </div>
          <Link href="/provider/requests" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            View requests
            <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </section>
      </section>

      <section aria-labelledby="provider-quick-actions">
        <div className="mb-4">
          <p className="section-kicker">Keep things moving</p>
          <h2 id="provider-quick-actions" className="mt-1 text-xl font-semibold text-foreground">
            Quick actions
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: "Update today's menu", href: "/provider/menus", icon: ClipboardList },
            { label: "Review requests", href: "/provider/requests", icon: FileText },
            { label: "Edit kitchen profile", href: "/provider/kitchen", icon: Store },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/25 hover:bg-[#fcfcf7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon aria-hidden="true" size={18} />
                </span>
                <span className="flex-1 text-sm font-semibold text-foreground">{action.label}</span>
                <ArrowRight aria-hidden="true" size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </section>

      <p className="rounded-xl border border-[#e7dfc9] bg-[#f8f4e9] px-4 py-3 text-xs leading-5 text-[#75633c]">
        Demo workspace: every figure, customer initials, and activity above is
        fictional. No live customer or subscription information is shown.
      </p>
    </div>
  );
}
