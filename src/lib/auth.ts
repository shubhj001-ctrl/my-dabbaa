import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/navigation";

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: AppRole;
  avatar_url: string | null;
  is_active: boolean;
};

const roleHome: Record<AppRole, string> = {
  customer: "/home",
  provider: "/provider/dashboard",
  admin: "/admin/dashboard",
};

async function getProfileForUser(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, avatar_url, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load the current user's profile.");
  }

  if (
    !data ||
    (data.role !== "customer" &&
      data.role !== "provider" &&
      data.role !== "admin")
  ) {
    return null;
  }

  return data;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error?.name === "AuthSessionMissingError") {
    return null;
  }

  if (error) {
    throw new Error("Unable to verify the current user.");
  }

  return data.user;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return getProfileForUser(user.id);
}

export async function getCurrentUserRole(): Promise<AppRole | null> {
  const user = await getCurrentUser();
  const profile = user ? await getProfileForUser(user.id) : null;

  if (!profile?.is_active) {
    return null;
  }

  if (profile.role === "admin" && user?.app_metadata.role !== "admin") {
    return null;
  }

  return profile?.role ?? null;
}

export async function getRoleHomePath(): Promise<string> {
  const user = await getCurrentUser();
  const profile = user ? await getProfileForUser(user.id) : null;

  if (!user || !profile || !profile.is_active) {
    return "/login";
  }

  if (
    profile.role === "admin" &&
    user.app_metadata.role !== "admin"
  ) {
    return "/access-denied";
  }

  return roleHome[profile.role];
}

export async function requireRole(role: AppRole): Promise<UserProfile> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileForUser(user.id);

  if (!profile || !profile.is_active) {
    redirect("/access-denied");
  }

  const isTrustedAdmin =
    profile.role === "admin" && user.app_metadata.role === "admin";

  if (role === "admin" && !isTrustedAdmin) {
    redirect(profile.role === "provider" ? roleHome.provider : roleHome.customer);
  }

  if (role !== profile.role) {
    if (profile.role === "admin" && !isTrustedAdmin) {
      redirect("/access-denied");
    }

    redirect(roleHome[profile.role]);
  }

  if (role === "admin" && !isTrustedAdmin) {
    redirect("/access-denied");
  }

  return profile;
}
