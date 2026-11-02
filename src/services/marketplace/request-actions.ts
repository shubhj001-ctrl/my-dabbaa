"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import {
  customerRequestSchema,
  providerDecisionSchema,
  withdrawRequestSchema,
} from "@/lib/validations/customer-request";
import { createClient } from "@/lib/supabase/server";

export type RequestActionResult =
  | { success: true; requestId?: string }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

function fieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Boolean(entry[1]),
    ),
  );
}

export async function submitCustomerRequestAction(
  input: unknown,
): Promise<RequestActionResult> {
  const parsed = customerRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Check the request details and try again.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user || !profile || profile.role !== "customer" || !profile.is_active) {
    return {
      success: false,
      message: "Sign in with an active customer account to send a request.",
    };
  }

  if (parsed.data.preferredStartDate < new Date().toISOString().slice(0, 10)) {
    return { success: false, message: "Choose today or a future start date." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_customer_request", {
    p_kitchen_id: parsed.data.kitchenId,
    p_preferred_meal: parsed.data.preferredMeal,
    p_preferred_start_date: parsed.data.preferredStartDate,
    p_message: parsed.data.message || null,
    p_consent_given: parsed.data.consentGiven,
  });

  if (error) {
    return {
      success: false,
      message:
        error.code === "23505"
          ? "You already have an active request with this kitchen."
          : "We couldn't send that request. The kitchen may no longer be accepting enquiries.",
    };
  }

  revalidatePath("/requests");
  revalidatePath("/provider/requests");
  return { success: true, requestId: data };
}

export async function withdrawCustomerRequestAction(
  input: unknown,
): Promise<RequestActionResult> {
  const parsed = withdrawRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "That request could not be found." };
  }

  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user || !profile || profile.role !== "customer" || !profile.is_active) {
    return { success: false, message: "Sign in with your customer account to continue." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("withdraw_customer_request", {
    p_request_id: parsed.data.requestId,
  });
  if (error) {
    return {
      success: false,
      message: "Only a pending request you sent can be withdrawn.",
    };
  }

  revalidatePath("/requests");
  revalidatePath("/provider/requests");
  return { success: true };
}

export async function respondToCustomerRequestAction(
  input: unknown,
): Promise<RequestActionResult> {
  const parsed = providerDecisionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "That request could not be found." };
  }

  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user || !profile || profile.role !== "provider" || !profile.is_active) {
    return { success: false, message: "Sign in with an active provider account to continue." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_customer_request", {
    p_request_id: parsed.data.requestId,
    p_decision: parsed.data.decision,
  });
  if (error) {
    return {
      success: false,
      message: "This pending request may have changed, or it isn't for a kitchen you own.",
    };
  }

  revalidatePath("/provider/requests");
  revalidatePath("/requests");
  revalidatePath("/provider/dashboard");
  return { success: true };
}
