"use client";

import { useActionState } from "react";
import { AuthFormMessage } from "@/components/auth/auth-field";
import { updateCustomerProfileAction } from "@/services/marketplace/profile-actions";

export function CustomerProfileForm({
  fullName,
  email,
  phone,
}: {
  fullName: string;
  email: string;
  phone: string;
}) {
  const [state, formAction, pending] = useActionState(updateCustomerProfileAction, {});

  return (
    <form action={formAction} className="provider-form-card max-w-2xl space-y-5">
      <div>
        <p className="section-kicker">ACCOUNT DETAILS</p>
        <h2 className="mt-1 text-xl font-black">Your contact information</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your email and phone stay private from kitchens until you authorize sharing and an activation is verified.
        </p>
      </div>

      <AuthFormMessage message={state.message} success={state.success} />
      <label className="form-field" htmlFor="fullName">
        Full name
        <input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={fullName}
          required
          minLength={2}
          maxLength={100}
          aria-invalid={Boolean(state.fieldErrors?.fullName)}
          aria-describedby={state.fieldErrors?.fullName ? "profile-name-error" : undefined}
        />
        {state.fieldErrors?.fullName ? (
          <span id="profile-name-error" className="text-sm text-destructive" role="alert">{state.fieldErrors.fullName}</span>
        ) : null}
      </label>

      <label className="form-field" htmlFor="email">
        Email address
        <input id="email" type="email" value={email} readOnly aria-describedby="profile-email-note" />
        <span id="profile-email-note" className="text-xs text-muted-foreground">To change your email, contact support so account verification can be preserved.</span>
      </label>

      <label className="form-field" htmlFor="phone">
        Mobile number
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={phone}
          required
          aria-invalid={Boolean(state.fieldErrors?.phone)}
          aria-describedby={state.fieldErrors?.phone ? "profile-phone-error" : "profile-phone-note"}
        />
        {state.fieldErrors?.phone ? (
          <span id="profile-phone-error" className="text-sm text-destructive" role="alert">{state.fieldErrors.phone}</span>
        ) : (
          <span id="profile-phone-note" className="text-xs text-muted-foreground">Use a valid Indian mobile number, with or without +91.</span>
        )}
      </label>

      <button className="form-primary" type="submit" disabled={pending}>
        {pending ? "Saving profile…" : "Save profile"}
      </button>
    </form>
  );
}
