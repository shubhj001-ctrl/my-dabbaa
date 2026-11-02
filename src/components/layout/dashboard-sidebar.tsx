"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";
import { BrandMark } from "@/components/marketplace/brand-mark";
import { roleNavigation } from "@/config/navigation";
import type { AppRole } from "@/types/navigation";

export function DashboardSidebar({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const navigation = roleNavigation[role];

  return (
    <aside className="shell-sidebar px-4 py-4 lg:flex lg:h-screen lg:flex-col lg:px-5 lg:py-6">
      <BrandMark href={navigation.homeHref} />

      <div className="mt-7 hidden px-2 lg:block">
        <p className="text-xs font-medium uppercase tracking-[0.13em] text-muted-foreground">
          {navigation.name} space
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {navigation.workspaceLabel}
        </p>
      </div>

      <nav
        aria-label={`${navigation.name} navigation`}
        className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:mt-8 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0"
      >
        {navigation.items.map((item) => {
          const Icon = item.icon;
          const current =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (role === "customer" &&
              item.href === "/explore" &&
              pathname.startsWith("/kitchens/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current ? "page" : undefined}
              className="shell-nav-link shrink-0 whitespace-nowrap"
            >
              <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden rounded-2xl bg-[var(--surface-soft)] p-4 lg:block">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin aria-hidden="true" size={16} className="text-primary" />
          Chandigarh, India
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Made for the kitchens and communities around you.
        </p>
      </div>
    </aside>
  );
}
