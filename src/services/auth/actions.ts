"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/navigation";

export type AuthFormState = {
  message?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
};

function formText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function firstFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors = new Map<string, string>();

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors.has(field)) {
      fieldErrors.set(field, issue.message);
    }
  }

  return Object.fromEntries(fieldErrors);
}

function getSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);

  return z.string().url().parse(siteUrl).replace(/\/$/, "");
}

function roleHome(role: AppRole) {
  if (role === "customer") {
    return "/home";
  }
  if (role === "provider") {
    return "/provider/dashboard";
  }
  return "/admin/dashboard";
}

function logRegistrationFailure(stage: string, error: unknown) {
  const diagnostic =
    typeof error === "object" && error !== null
      ? error
      : undefined;
  const errorName =
    error instanceof Error
      ? error.name
      : typeof diagnostic === "object" &&
          diagnostic &&
          "name" in diagnostic &&
          typeof diagnostic.name === "string"
        ? diagnostic.name
        : "UnknownError";
  const errorCode =
    typeof diagnostic === "object" &&
    diagnostic &&
    "code" in diagnostic &&
    typeof diagnostic.code === "string"
      ? diagnostic.code
      : undefined;

  console.error("[auth.register] operation failed", {
    stage,
    errorName,
    ...(errorCode ? { errorCode } : {}),
  });
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    fullName: formText(formData, "fullName"),
    email: formText(formData, "email"),
    phone: formText(formData, "phone"),
    password: formText(formData, "password"),
    confirmPassword: formText(formData, "confirmPassword"),
    role: formText(formData, "role"),
    termsAccepted: formData.get("termsAccepted") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error) };
  }

  let redirectPath: string | undefined;
  let stage = "site_url";

  try {
    const siteUrl = getSiteUrl();
    stage = "supabase_client";
    const supabase = await createClient();
    stage = "supabase_signup";
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone,
          role: parsed.data.role,
        },
      },
    });

    if (error || !data.user) {
      if (error) {
        logRegistrationFailure("supabase_signup", error);
      } else {
        console.error("[auth.register] Supabase returned no user", {
          stage: "supabase_signup",
        });
      }

      return {
        message:
          "We couldn't create your account. If you already registered, try logging in or resetting your password.",
      };
    }

    if (!data.session) {
      return {
        success: true,
        message:
          "If registration is complete, check your email for a confirmation link before logging in.",
      };
    }

    stage = "profile_lookup";
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      logRegistrationFailure("profile_lookup", profileError);
      return {
        message:
          "Your account was created, but we couldn't finish setting up your profile. Please contact support.",
      };
    }

    if (!profile || !profile.is_active || profile.role !== parsed.data.role) {
      console.error("[auth.register] profile verification failed", {
        stage: "profile_verification",
        profileFound: Boolean(profile),
        profileActive: profile?.is_active ?? false,
        roleMatchesSelection: profile?.role === parsed.data.role,
      });
      return {
        message:
          "Your account was created, but we couldn't finish setting up your profile. Please contact support.",
      };
    }

    redirectPath = roleHome(profile.role);
  } catch (error) {
    logRegistrationFailure(stage, error);
    return {
      message:
        "Account registration is temporarily unavailable. Please try again later.",
    };
  }

  if (redirectPath) {
    redirect(redirectPath);
  }

  return {
    message:
      "Your account was created, but we couldn't complete sign-in. Please log in to continue.",
  };
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formText(formData, "email"),
    password: formText(formData, "password"),
  });

  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { message: "We couldn't sign you in with those details." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) {
    await supabase.auth.signOut();
    return {
      message: "This account is unavailable. Please contact support.",
    };
  }

  if (
    profile.role === "admin" &&
    data.user.app_metadata.role !== "admin"
  ) {
    await supabase.auth.signOut();
    return { message: "This account is unavailable. Please contact support." };
  }

  redirect(roleHome(profile.role));
}

export async function forgotPasswordAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formText(formData, "email"),
  });

  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`,
    },
  );

  if (error) {
    return {
      message:
        "We couldn't send reset instructions right now. Please try again later.",
    };
  }

  return {
    success: true,
    message:
      "If an account exists for that email, password reset instructions are on their way.",
  };
}

export async function resetPasswordAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formText(formData, "password"),
    confirmPassword: formText(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error) };
  }

  const user = await getCurrentUser();

  if (!user) {
    return {
      message:
        "This reset link has expired or is invalid. Request a new password reset.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      message:
        "We couldn't update your password. Request a new reset link and try again.",
    };
  }

  await supabase.auth.signOut();
  redirect("/login?message=password-updated");
}

export async function logoutAction(): Promise<never> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Unable to end the current session.");
  }

  redirect("/login");
}
