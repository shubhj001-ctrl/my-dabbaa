import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type {
  KitchenPhotoRow,
  KitchenRow,
  KitchenServiceAreaRow,
  MenuPostRow,
  SubscriptionPlanRow,
} from "@/types/supabase";

export type ProviderKitchenData = {
  kitchen: KitchenRow;
  photos: (KitchenPhotoRow & { signed_url: string })[];
  serviceAreas: KitchenServiceAreaRow[];
  plans: SubscriptionPlanRow[];
  menus: MenuPostRow[];
};

export type ProviderDataResult =
  | { status: "live"; data: ProviderKitchenData | null }
  | { status: "unconfigured" }
  | { status: "error" };

export async function getProviderKitchenData(): Promise<ProviderDataResult> {
  if (!isSupabaseConfigured()) return { status: "unconfigured" };
  const supabase = await createClient();
  const { data: kitchen, error: kitchenError } = await supabase
    .from("kitchens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (kitchenError) return { status: "error" };
  if (!kitchen) return { status: "live", data: null };

  const [photosResult, areasResult, plansResult, menusResult] = await Promise.all([
    supabase.from("kitchen_photos").select("*").eq("kitchen_id", kitchen.id).order("display_order"),
    supabase.from("kitchen_service_areas").select("*").eq("kitchen_id", kitchen.id).order("sector"),
    supabase.from("subscription_plans").select("*").eq("kitchen_id", kitchen.id).order("created_at", { ascending: false }),
    supabase.from("menu_posts").select("*").eq("kitchen_id", kitchen.id).order("menu_date", { ascending: false }),
  ]);
  if (photosResult.error || areasResult.error || plansResult.error || menusResult.error) {
    return { status: "error" };
  }

  const signedResult = photosResult.data.length
    ? await supabase.storage
        .from("kitchen-images")
        .createSignedUrls(photosResult.data.map((photo) => photo.storage_path), 600)
    : { data: [], error: null };
  if (signedResult.error || !signedResult.data) return { status: "error" };
  const signedByPath = new Map(
    signedResult.data.flatMap((entry) =>
      entry.signedUrl && entry.path ? [[entry.path, entry.signedUrl] as const] : [],
    ),
  );

  return {
    status: "live",
    data: {
      kitchen,
      photos: photosResult.data.map((photo) => ({
        ...photo,
        signed_url: signedByPath.get(photo.storage_path) ?? "",
      })),
      serviceAreas: areasResult.data,
      plans: plansResult.data,
      menus: menusResult.data,
    },
  };
}
