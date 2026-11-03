"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validations/profile";

export type ProfileActionState = {
  success?: boolean;
  message?: string;
  fieldErrors?: { fullName?: string; phone?: string };
};

export async function updateCustomerProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return {
      message: "Check the details and try again.",
      fieldErrors: {
        fullName: errors.fullName?.[0],
        phone: errors.phone?.[0],
      },
    };
  }

  const profile = await requireRole("customer");
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
    })
    .eq("id", profile.id);

  if (error) {
    console.error("Unable to update customer profile:", error.code);
    return { message: "We couldn't save your profile. Please try again." };
  }

  revalidatePath("/profile");
  return { success: true, message: "Your profile has been updated." };
}
