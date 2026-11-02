"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  AuthField,
  AuthFormMessage,
} from "@/components/auth/auth-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { loginAction, type AuthFormState } from "@/services/auth/actions";

const initialState: AuthFormState = {};

export function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);
  const noticeMessage =
    notice === "password-updated"
      ? "Your password has been updated. Please log in."
      : notice === "check-email"
        ? "Check your email to confirm your new account."
        : notice === "confirmation-failed"
          ? "That confirmation link has expired or is invalid. Request a new one or log in."
        : undefined;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthFormMessage
        message={noticeMessage}
        success={notice !== "confirmation-failed"}
      />
      <AuthFormMessage message={state.message} />
      <AuthField
        id="email"
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email}
      />
      <div className="space-y-2">
        <AuthField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={state.fieldErrors?.password}
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <SubmitButton pendingLabel="Signing you in…">Log in</SubmitButton>
      <p className="text-center text-xs text-muted-foreground">
        New to My Dabbaa?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
