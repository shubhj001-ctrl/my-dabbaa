import { Suspense } from "react";
import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/auth";

export default function ProviderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
      <ProviderContent>{children}</ProviderContent>
    </Suspense>
  );
}

async function ProviderContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole("provider");
  return <RoleShell role="provider">{children}</RoleShell>;
}
