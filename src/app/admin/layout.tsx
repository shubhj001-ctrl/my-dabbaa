import { Suspense } from "react";
import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/auth";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
      <AdminContent>{children}</AdminContent>
    </Suspense>
  );
}

async function AdminContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole("admin");
  return <RoleShell role="admin">{children}</RoleShell>;
}
