"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  AuthField,
  AuthFormMessage,
} from "@/components/auth/auth-field";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  forgotPasswordAction,
  type AuthFormState,
} from "@/services/auth/actions";

const initialState: AuthFormState = {};

export function ForgotPasswordForm({ expired = false }: { expired?: boolean }) {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {expired ? (
        <AuthFormMessage message="That reset link has expired or is invalid. Request a new one below." />
      ) : null}
      <AuthFormMessage message={state.message} success={state.success} />
      <AuthField
        id="email"
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email}
      />
      <SubmitButton pendingLabel="Sending instructions…">
        Send reset link
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Back to login
        </Link>
      </p>
    </form>
  );
}
