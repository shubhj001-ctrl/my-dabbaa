"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import {
  kitchenDraftSchema,
  menuPostSchema,
  planSchema,
} from "@/lib/validations/kitchen";

type ActionResult =
  | { success: true; kitchenId?: string }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

async function getProviderContext() {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user || !profile || profile.role !== "provider" || !profile.is_active) {
    return null;
  }
  return { user, profile };
}

function kitchenSlug(name: string) {
  return `${name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)}-${randomUUID().slice(0, 8)}`;
}

export async function saveKitchenDraftAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = kitchenDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Check the kitchen details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const context = await getProviderContext();
  if (!context) {
    return { success: false, message: "Sign in with an active provider account to continue." };
  }

  const { data } = parsed;
  const supabase = await createClient();
  const { data: existing, error: existingError } = data.id
    ? await supabase
        .from("kitchens")
        .select("id,slug")
        .eq("id", data.id)
        .eq("owner_id", context.user.id)
        .maybeSingle()
    : { data: null, error: null };

  if (existingError || (data.id && !existing)) {
    return { success: false, message: "We couldn't find a kitchen listing you can edit." };
  }

  const kitchenData = {
    owner_id: context.user.id,
    kitchen_name: data.kitchenName,
    contact_name: data.contactName,
    slug: existing?.slug ?? kitchenSlug(data.kitchenName),
    description: data.description,
    contact_phone: data.contactPhone,
    contact_email: data.contactEmail.toLowerCase(),
    address: data.address,
    city: "Chandigarh",
    sector: data.sector,
    pincode: data.pincode,
    cuisine_types: data.cuisineTypes,
    food_type: data.foodType,
    preparation_type: data.preparationType,
    meal_categories: data.mealCategories,
    avg_daily_capacity: data.avgDailyCapacity,
    operating_days: data.operatingDays,
    opening_time: data.openingTime,
    closing_time: data.closingTime,
  };

  const result = existing
    ? await supabase
        .from("kitchens")
        .update(kitchenData)
        .eq("id", existing.id)
        .eq("owner_id", context.user.id)
        .select("id")
        .single()
    : await supabase
        .from("kitchens")
        .insert(kitchenData)
        .select("id")
        .single();

  if (result.error || !result.data) {
    return {
      success: false,
      message: "We couldn't save the listing. Please check the details and try again.",
    };
  }

  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/kitchen");
  return { success: true, kitchenId: result.data.id };
}

const finalizeSchema = z.object({
  kitchenId: z.string().uuid(),
  serviceSectors: kitchenDraftSchema.shape.serviceSectors,
  photos: z.array(z.object({
    path: z.string().min(1).max(200),
    imageType: z.enum(["kitchen", "food"]),
    displayOrder: z.number().int().min(0).max(30),
  })).min(1).max(6),
});
const recordIdSchema = z.string().uuid();

export async function finalizeKitchenApplicationAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = finalizeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Add at least one valid photo and service area before submitting.",
    };
  }
  const context = await getProviderContext();
  if (!context) return { success: false, message: "Sign in with an active provider account." };
  const { kitchenId, serviceSectors, photos } = parsed.data;
  if (new Set(serviceSectors).size !== serviceSectors.length) {
    return { success: false, message: "Remove duplicate service sectors." };
  }
  if (photos.some((photo) => !photo.path.startsWith(`${kitchenId}/`))) {
    return { success: false, message: "One or more uploaded images do not belong to this kitchen." };
  }

  const supabase = await createClient();
  const { data: kitchen, error: kitchenError } = await supabase
    .from("kitchens")
    .select("id,pincode")
    .eq("id", kitchenId)
    .eq("owner_id", context.user.id)
    .maybeSingle();
  if (kitchenError || !kitchen) {
    return { success: false, message: "We couldn't find a kitchen listing you can submit." };
  }

  const { data: storedFiles, error: storageError } = await supabase.storage
    .from("kitchen-images")
    .list(kitchenId, { limit: 100 });
  if (storageError || !storedFiles) {
    return { success: false, message: "We couldn't verify the uploaded photos. Please upload them again." };
  }
  const storedNames = new Set(storedFiles.map((file) => `${kitchenId}/${file.name}`));
  if (photos.some((photo) => !storedNames.has(photo.path))) {
    return { success: false, message: "One or more photos could not be verified. Please upload them again." };
  }

  const areaRows = serviceSectors.map((sector) => ({
    kitchen_id: kitchenId,
    sector,
    pincode: kitchen.pincode,
    locality: null,
    is_active: true,
  }));
  const { error: areaError } = await supabase
    .from("kitchen_service_areas")
    .upsert(areaRows, { onConflict: "kitchen_id,sector" });
  if (areaError) return { success: false, message: "We couldn't save the selected service areas." };

  const selectedAreas = new Set(serviceSectors);
  const { data: existingAreas, error: existingAreasError } = await supabase
    .from("kitchen_service_areas")
    .select("id,sector")
    .eq("kitchen_id", kitchenId);
  if (existingAreasError || !existingAreas) {
    return { success: false, message: "We couldn't verify the service areas." };
  }
  const removedAreas = existingAreas.filter((area) => !selectedAreas.has(area.sector));
  for (const area of removedAreas) {
    const { error } = await supabase
      .from("kitchen_service_areas")
      .delete()
      .eq("id", area.id)
      .eq("kitchen_id", kitchenId);
    if (error) return { success: false, message: "We couldn't update the service areas." };
  }

  const photoRows = photos.map((photo) => ({
    kitchen_id: kitchenId,
    image_url: `storage://${photo.path}`,
    storage_path: photo.path,
    image_type: photo.imageType,
    display_order: photo.displayOrder,
  }));
  const { error: photoError } = await supabase
    .from("kitchen_photos")
    .upsert(photoRows, { onConflict: "storage_path" });
  if (photoError) return { success: false, message: "We couldn't save the photo details." };

  const { error: submitError } = await supabase.rpc(
    "submit_kitchen_application",
    { p_kitchen_id: kitchenId },
  );
  if (submitError) {
    return {
      success: false,
      message: "Your listing is saved as a draft, but could not be submitted. Please try again.",
    };
  }

  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/kitchen");
  revalidatePath("/admin/kitchens");
  revalidatePath("/explore");
  return { success: true, kitchenId };
}

export async function savePlanAction(input: unknown): Promise<ActionResult> {
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Check the plan details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const context = await getProviderContext();
  if (!context) return { success: false, message: "Sign in with an active provider account." };
  const supabase = await createClient();
  const { data: kitchen, error: kitchenError } = await supabase
    .from("kitchens")
    .select("id")
    .eq("owner_id", context.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (kitchenError) return { success: false, message: "We couldn't load your kitchen." };
  if (!kitchen) return { success: false, message: "Create a kitchen listing before adding plans." };

  const values = {
    kitchen_id: kitchen.id,
    plan_name: parsed.data.planName,
    description: parsed.data.description,
    meal_type: parsed.data.mealType,
    price: parsed.data.price,
    duration_days: parsed.data.durationDays,
    meals_per_week: parsed.data.mealsPerWeek,
    is_vegetarian: parsed.data.isVegetarian,
  };
  const result = parsed.data.id
    ? await supabase.from("subscription_plans").update(values).eq("id", parsed.data.id).eq("kitchen_id", kitchen.id).select("id").maybeSingle()
    : await supabase.from("subscription_plans").insert(values).select("id").single();
  if (result.error) return { success: false, message: "We couldn't save this plan. Please try again." };
  if (!result.data) return { success: false, message: "We couldn't find a plan you can edit." };
  revalidatePath("/provider/plans");
  revalidatePath("/explore");
  return { success: true };
}

export async function setPlanActiveAction(
  planId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const parsedPlanId = recordIdSchema.safeParse(planId);
  const parsedActive = z.boolean().safeParse(isActive);
  if (!parsedPlanId.success || !parsedActive.success) {
    return { success: false, message: "Invalid plan update." };
  }
  const context = await getProviderContext();
  if (!context) return { success: false, message: "Sign in with an active provider account." };
  const supabase = await createClient();
  const { data: kitchen, error: kitchenError } = await supabase
    .from("kitchens")
    .select("id")
    .eq("owner_id", context.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (kitchenError) return { success: false, message: "We couldn't load your kitchen." };
  if (!kitchen) return { success: false, message: "Create a kitchen listing first." };
  const { data, error } = await supabase
    .from("subscription_plans")
    .update({ is_active: isActive })
    .eq("id", parsedPlanId.data)
    .eq("kitchen_id", kitchen.id)
    .select("id")
    .maybeSingle();
  if (error) return { success: false, message: "We couldn't update this plan." };
  if (!data) return { success: false, message: "We couldn't find a plan you can edit." };
  revalidatePath("/provider/plans");
  revalidatePath("/explore");
  return { success: true };
}

export async function deletePlanAction(planId: string): Promise<ActionResult> {
  const parsedPlanId = recordIdSchema.safeParse(planId);
  if (!parsedPlanId.success) return { success: false, message: "Invalid plan." };
  const context = await getProviderContext();
  if (!context) return { success: false, message: "Sign in with an active provider account." };
  const supabase = await createClient();
  const { data: kitchen, error: kitchenError } = await supabase
    .from("kitchens")
    .select("id")
    .eq("owner_id", context.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (kitchenError) return { success: false, message: "We couldn't load your kitchen." };
  if (!kitchen) return { success: false, message: "Create a kitchen listing first." };
  const { data, error } = await supabase
    .from("subscription_plans")
    .delete()
    .eq("id", parsedPlanId.data)
    .eq("kitchen_id", kitchen.id)
    .select("id")
    .maybeSingle();
  if (error) return { success: false, message: "This plan could not be deleted." };
  if (!data) return { success: false, message: "We couldn't find a plan you can delete." };
  revalidatePath("/provider/plans");
  return { success: true };
}

export async function saveMenuPostAction(input: unknown): Promise<ActionResult> {
  const parsed = menuPostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Check the menu details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const context = await getProviderContext();
  if (!context) return { success: false, message: "Sign in with an active provider account." };
  const supabase = await createClient();
  const { data: kitchen, error: kitchenError } = await supabase
    .from("kitchens")
    .select("id")
    .eq("owner_id", context.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (kitchenError) return { success: false, message: "We couldn't load your kitchen." };
  if (!kitchen) return { success: false, message: "Create a kitchen listing before publishing a menu." };
  const values = {
    kitchen_id: kitchen.id,
    menu_date: parsed.data.menuDate,
    meal_type: parsed.data.mealType,
    title: parsed.data.title,
    description: parsed.data.description,
    image_url: parsed.data.imageUrl || null,
    is_published: parsed.data.isPublished,
  };
  const result = parsed.data.id
    ? await supabase.from("menu_posts").update(values).eq("id", parsed.data.id).eq("kitchen_id", kitchen.id).select("id").maybeSingle()
    : await supabase.from("menu_posts").insert(values).select("id").single();
  if (result.error) return { success: false, message: "We couldn't save this menu. A kitchen can have one post per meal each day." };
  if (!result.data) return { success: false, message: "We couldn't find a menu you can edit." };
  revalidatePath("/provider/menus");
  revalidatePath("/explore");
  return { success: true };
}

export async function deleteMenuPostAction(postId: string): Promise<ActionResult> {
  const parsedPostId = recordIdSchema.safeParse(postId);
  if (!parsedPostId.success) return { success: false, message: "Invalid menu post." };
  const context = await getProviderContext();
  if (!context) return { success: false, message: "Sign in with an active provider account." };
  const supabase = await createClient();
  const { data: kitchen, error: kitchenError } = await supabase
    .from("kitchens")
    .select("id")
    .eq("owner_id", context.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (kitchenError) return { success: false, message: "We couldn't load your kitchen." };
  if (!kitchen) return { success: false, message: "Create a kitchen listing first." };
  const { data, error } = await supabase.from("menu_posts").delete().eq("id", parsedPostId.data).eq("kitchen_id", kitchen.id).select("id").maybeSingle();
  if (error) return { success: false, message: "We couldn't delete this menu." };
  if (!data) return { success: false, message: "We couldn't find a menu you can delete." };
  revalidatePath("/provider/menus");
  revalidatePath("/explore");
  return { success: true };
}
