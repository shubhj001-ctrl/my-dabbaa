import { Suspense } from "react";
import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/auth";

export default function ProtectedCustomerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<div className="min-h-48" aria-busy="true" />}>
      <ProtectedCustomerContent>{children}</ProtectedCustomerContent>
    </Suspense>
  );
}

async function ProtectedCustomerContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole("customer");
  return <RoleShell role="customer">{children}</RoleShell>;
}
