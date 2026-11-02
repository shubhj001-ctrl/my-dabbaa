import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  return (
    <AuthShell
      title="Welcome back to your table."
      description="Log in to continue with the kitchens and people you care about."
    >
      <Suspense fallback={<LoginForm />}>
        <LoginPageForm searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function LoginPageForm({
  searchParams,
}: Pick<PageProps<"/login">, "searchParams">) {
  const { message } = await searchParams;
  return <LoginForm notice={typeof message === "string" ? message : undefined} />;
}
