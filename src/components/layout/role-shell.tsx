"use client";

import { Suspense } from "react";
import { LogOut, MapPin } from "lucide-react";
import { roleNavigation } from "@/config/navigation";
import type { AppRole } from "@/types/navigation";
import { logoutAction } from "@/services/auth/actions";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

type RoleShellProps = {
  role: AppRole;
  children: React.ReactNode;
};

export function RoleShell({ role, children }: RoleShellProps) {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-background"
          aria-label="Loading workspace"
        />
      }
    >
      <RoleShellContent role={role}>{children}</RoleShellContent>
    </Suspense>
  );
}

function RoleShellContent({ role, children }: RoleShellProps) {
  const navigation = roleNavigation[role];

  return (
    <div className="shell-grid lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <DashboardSidebar role={role} />

      <div className="shell-main flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-4 sm:px-7 lg:px-10">
          <div>
            <p className="text-sm font-medium text-foreground">
              {navigation.workspaceLabel}
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              A good meal starts close to home.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <MapPin aria-hidden="true" size={14} className="text-primary" />
              Chandigarh
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <LogOut aria-hidden="true" size={15} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1160px] flex-1 px-4 py-8 sm:px-7 sm:py-10 lg:px-10">
          {children}
        </main>

        <footer className="px-4 pb-6 text-center text-xs text-muted-foreground sm:px-7 lg:px-10">
          A little more home in every dabbaa.
        </footer>
      </div>
    </div>
  );
}
