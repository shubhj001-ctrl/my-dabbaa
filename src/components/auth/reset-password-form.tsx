"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  AuthField,
  AuthFormMessage,
} from "@/components/auth/auth-field";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  resetPasswordAction,
  type AuthFormState,
} from "@/services/auth/actions";

const initialState: AuthFormState = {};

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthFormMessage message={state.message} />
      <AuthField
        id="password"
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="Use at least 12 characters."
        error={state.fieldErrors?.password}
      />
      <AuthField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
      />
      <SubmitButton pendingLabel="Updating password…">
        Set new password
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/forgot-password"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Request another reset link
        </Link>
      </p>
    </form>
  );
}
