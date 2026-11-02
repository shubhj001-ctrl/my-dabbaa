"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { kitchenReviewSchema } from "@/lib/validations/kitchen";

export async function reviewKitchenAction(input: unknown) {
  const parsed = kitchenReviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: parsed.error.flatten().fieldErrors.reason?.[0] ??
        "Check the review details and try again.",
    };
  }

  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.rpc("review_kitchen", {
    p_kitchen_id: parsed.data.kitchenId,
    p_decision: parsed.data.decision,
    p_reason: parsed.data.reason || null,
  });
  if (error) {
    return {
      success: false as const,
      message: "We couldn't update this application. Refresh the queue and try again.",
    };
  }

  revalidatePath("/admin/kitchens");
  revalidatePath("/explore");
  revalidatePath(`/kitchens/${parsed.data.kitchenId}`);
  return { success: true as const, message: "Kitchen status updated." };
}
