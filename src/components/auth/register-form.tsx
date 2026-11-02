"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  AuthField,
  AuthFormMessage,
} from "@/components/auth/auth-field";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  registerAction,
  type AuthFormState,
} from "@/services/auth/actions";

const initialState: AuthFormState = {};

export function RegisterForm({
  initialRole = "customer",
}: {
  initialRole?: "customer" | "provider";
}) {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <AuthFormMessage message={state.message} success={state.success} />

      <AuthField
        id="fullName"
        name="fullName"
        label="Full name"
        autoComplete="name"
        error={state.fieldErrors?.fullName}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField
          id="email"
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          error={state.fieldErrors?.email}
        />
        <AuthField
          id="phone"
          name="phone"
          label="Phone number"
          type="tel"
          autoComplete="tel"
          hint="Indian mobile number, with or without +91."
          error={state.fieldErrors?.phone}
        />
      </div>

      <fieldset
        className="space-y-2"
        aria-invalid={Boolean(state.fieldErrors?.role)}
        aria-describedby={state.fieldErrors?.role ? "role-error" : undefined}
      >
        <legend className="text-sm font-medium text-foreground">
          I am joining as a
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "customer", title: "Customer", note: "Find your table" },
            { value: "provider", title: "Provider", note: "Share your kitchen" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent"
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                defaultChecked={option.value === initialRole}
                className="mt-1 accent-primary"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  {option.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {option.note}
                </span>
              </span>
            </label>
          ))}
        </div>
        {state.fieldErrors?.role ? (
          <p id="role-error" className="text-sm text-destructive" role="alert">
            {state.fieldErrors.role}
          </p>
        ) : null}
      </fieldset>

      <AuthField
        id="password"
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="Use at least 12 characters."
        error={state.fieldErrors?.password}
      />
      <AuthField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
      />

      <div className="space-y-1.5">
        <label className="flex items-start gap-3 text-sm leading-5 text-muted-foreground">
          <input
            type="checkbox"
            name="termsAccepted"
            className="mt-1 size-4 shrink-0 accent-primary"
            aria-invalid={Boolean(state.fieldErrors?.termsAccepted)}
            aria-describedby={
              state.fieldErrors?.termsAccepted ? "terms-error" : undefined
            }
          />
          <span>
            I agree to the My Dabbaa terms and privacy policy.
          </span>
        </label>
        {state.fieldErrors?.termsAccepted ? (
          <p id="terms-error" className="text-sm text-destructive" role="alert">
            {state.fieldErrors.termsAccepted}
          </p>
        ) : null}
      </div>

      <SubmitButton pendingLabel="Creating your account…">
        Create account
      </SubmitButton>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Provider and kitchen registration are free.
      </p>
      <p className="text-center text-xs text-muted-foreground">
        Have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
