import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create your account",
};

export default function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  return (
    <AuthShell
      title="Your next favourite kitchen is waiting."
      description="Create an account to find everyday tiffins or introduce your kitchen to Chandigarh."
    >
      <Suspense fallback={<RegisterForm />}>
        <RegisterPageForm searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function RegisterPageForm({
  searchParams,
}: Pick<PageProps<"/register">, "searchParams">) {
  const { type } = await searchParams;
  return <RegisterForm initialRole={type === "provider" ? "provider" : "customer"} />;
}
