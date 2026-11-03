import "server-only";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type {
  KitchenPhotoRow,
  KitchenRow,
  KitchenServiceAreaRow,
  ProfileRow,
} from "@/types/supabase";

export type ReviewApplication = {
  kitchen: KitchenRow;
  photos: (KitchenPhotoRow & { signed_url: string })[];
  serviceAreas: KitchenServiceAreaRow[];
  providerName: string;
};

export type AdminKitchenQueueResult =
  | { status: "live"; data: ReviewApplication[] }
  | { status: "unconfigured" }
  | { status: "error" };

export type AdminProvider = Pick<
  ProfileRow,
  "id" | "full_name" | "email" | "phone" | "is_active" | "created_at"
> & {
  kitchens: Pick<
    KitchenRow,
    "id" | "kitchen_name" | "approval_status" | "is_listed" | "created_at"
  >[];
};

export type AdminProvidersResult =
  | { status: "live"; data: AdminProvider[] }
  | { status: "unconfigured" }
  | { status: "error" };

export async function getProviders(): Promise<AdminProvidersResult> {
  if (!isSupabaseConfigured()) return { status: "unconfigured" };

  const supabase = await createClient();
  const { data: providers, error: providersError } = await supabase
    .from("profiles")
    .select("id,full_name,email,phone,is_active,created_at")
    .eq("role", "provider")
    .order("created_at", { ascending: false });

  if (providersError || !providers) {
    console.error("Unable to load admin provider directory:", providersError?.code);
    return { status: "error" };
  }
  if (!providers.length) return { status: "live", data: [] };

  const { data: kitchens, error: kitchensError } = await supabase
    .from("kitchens")
    .select("id,owner_id,kitchen_name,approval_status,is_listed,created_at")
    .in("owner_id", providers.map((provider) => provider.id))
    .order("created_at", { ascending: false });

  if (kitchensError || !kitchens) {
    console.error("Unable to load kitchens for admin provider directory:", kitchensError?.code);
    return { status: "error" };
  }

  const kitchensByProvider = new Map<string, AdminProvider["kitchens"]>();
  for (const kitchen of kitchens) {
    const providerKitchens = kitchensByProvider.get(kitchen.owner_id) ?? [];
    providerKitchens.push({
      id: kitchen.id,
      kitchen_name: kitchen.kitchen_name,
      approval_status: kitchen.approval_status,
      is_listed: kitchen.is_listed,
      created_at: kitchen.created_at,
    });
    kitchensByProvider.set(kitchen.owner_id, providerKitchens);
  }

  return {
    status: "live",
    data: providers.map((provider) => ({
      ...provider,
      kitchens: kitchensByProvider.get(provider.id) ?? [],
    })),
  };
}

export async function getKitchenApplications(): Promise<AdminKitchenQueueResult> {
  if (!isSupabaseConfigured()) return { status: "unconfigured" };
  const supabase = await createClient();
  const { data: kitchens, error } = await supabase
    .from("kitchens")
    .select("*")
    .in("approval_status", ["pending", "approved"])
    .order("created_at", { ascending: true });
  if (error || !kitchens) return { status: "error" };
  if (!kitchens.length) return { status: "live", data: [] };

  const ids = kitchens.map((kitchen) => kitchen.id);
  const ownerIds = [...new Set(kitchens.map((kitchen) => kitchen.owner_id))];
  const [photosResult, areasResult, profilesResult] = await Promise.all([
    supabase.from("kitchen_photos").select("*").in("kitchen_id", ids).order("display_order"),
    supabase.from("kitchen_service_areas").select("*").in("kitchen_id", ids).order("sector"),
    supabase.from("profiles").select("id,full_name").in("id", ownerIds),
  ]);
  if (photosResult.error || areasResult.error || profilesResult.error) {
    return { status: "error" };
  }

  const signedResult = photosResult.data.length
    ? await supabase
        .storage
        .from("kitchen-images")
        .createSignedUrls(photosResult.data.map((photo) => photo.storage_path), 600)
    : { data: [], error: null };
  if (signedResult.error || !signedResult.data) return { status: "error" };
  const signedByPath = new Map(
    signedResult.data.flatMap((entry) =>
      entry.signedUrl && entry.path ? [[entry.path, entry.signedUrl] as const] : [],
    ),
  );
  const profileById = new Map(profilesResult.data.map((profile) => [profile.id, profile.full_name]));
  const photosByKitchen = new Map<string, ReviewApplication["photos"]>();
  for (const photo of photosResult.data) {
    const list = photosByKitchen.get(photo.kitchen_id) ?? [];
    list.push({
      ...photo,
      signed_url: signedByPath.get(photo.storage_path) ?? "",
    });
    photosByKitchen.set(photo.kitchen_id, list);
  }
  const areasByKitchen = new Map<string, KitchenServiceAreaRow[]>();
  for (const area of areasResult.data) {
    const list = areasByKitchen.get(area.kitchen_id) ?? [];
    list.push(area);
    areasByKitchen.set(area.kitchen_id, list);
  }

  return {
    status: "live",
    data: kitchens.map((kitchen) => ({
      kitchen,
      photos: photosByKitchen.get(kitchen.id) ?? [],
      serviceAreas: areasByKitchen.get(kitchen.id) ?? [],
      providerName: profileById.get(kitchen.owner_id) ?? "Provider",
    })),
  };
}
