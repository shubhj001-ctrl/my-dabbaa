import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default function ForgotPasswordPage({
  searchParams,
}: PageProps<"/forgot-password">) {
  return (
    <AuthShell
      title="Let’s get you back in."
      description="Enter the email address linked to your account and we’ll send password reset instructions."
    >
      <Suspense fallback={<ForgotPasswordForm />}>
        <ForgotPasswordPageForm searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function ForgotPasswordPageForm({
  searchParams,
}: Pick<PageProps<"/forgot-password">, "searchParams">) {
  const { error } = await searchParams;
  return <ForgotPasswordForm expired={error === "invalid-reset"} />;
}
