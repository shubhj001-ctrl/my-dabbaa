import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Choose a new password",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password."
      description="Set a strong password to secure your My Dabbaa account."
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground" role="status">
            Checking your secure reset link…
          </p>
        }
      >
        <ResetPasswordPageContent />
      </Suspense>
    </AuthShell>
  );
}

async function ResetPasswordPageContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/forgot-password?error=invalid-reset");
  }

  return <ResetPasswordForm />;
}
