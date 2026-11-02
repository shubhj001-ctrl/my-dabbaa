import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type {
  KitchenPhotoRow,
  KitchenRow,
  MenuPostRow,
  SubscriptionPlanRow,
} from "@/types/supabase";
import type { Kitchen } from "@/types/marketplace";

export type DataAvailability = "live" | "demo" | "unavailable" | "error";
export type MarketplaceResult<T> =
  | { status: "live"; data: T }
  | { status: "unconfigured" }
  | { status: "error" };

type RelatedData = {
  photos: KitchenPhotoRow[];
  plans: SubscriptionPlanRow[];
  menus: MenuPostRow[];
  areas: { kitchen_id: string; sector: string; is_active: boolean }[];
};

function toKitchen(row: KitchenRow, related: RelatedData): Kitchen {
  const photos = related.photos
    .filter((photo) => photo.kitchen_id === row.id)
    .sort((a, b) => a.display_order - b.display_order);
  const plans = related.plans.filter((plan) => plan.kitchen_id === row.id);
  const menus = related.menus
    .filter((menu) => menu.kitchen_id === row.id)
    .sort((a, b) => a.menu_date.localeCompare(b.menu_date));
  const serviceAreas = related.areas
    .filter((area) => area.kitchen_id === row.id && area.is_active)
    .map((area) => area.sector);

  return {
    id: row.slug,
    databaseId: row.id,
    slug: row.slug,
    name: row.kitchen_name,
    tagline: row.description.slice(0, 100),
    description: row.description,
    sector: row.sector,
    location: `${row.sector}, Chandigarh`,
    serviceAreas,
    rating: 0,
    reviewCount: 0,
    startingPrice: plans.length
      ? Math.min(...plans.map((plan) => Number(plan.price)))
      : 0,
    mealTypes: row.cuisine_types,
    mealCategories: row.meal_categories.map(
      (meal) => meal.charAt(0).toUpperCase() + meal.slice(1) as "Breakfast" | "Lunch" | "Dinner",
    ),
    foodType: row.food_type,
    isVegetarian: row.food_type === "vegetarian",
    image: photos[0]?.image_url ?? "",
    gallery: photos.map((photo) => photo.image_url),
    badge: row.preparation_type.replaceAll("_", " "),
    menu: menus.map((menu) => ({
      id: menu.id,
      name: menu.title,
      description: menu.description,
      category: menu.meal_type.charAt(0).toUpperCase() + menu.meal_type.slice(1) as "Breakfast" | "Lunch" | "Dinner",
      isVegetarian: row.food_type === "vegetarian",
      imageUrl: menu.image_url ?? undefined,
    })),
    plans: plans.map((plan) => ({
      id: plan.id,
      name: plan.plan_name,
      duration: `${plan.duration_days} days`,
      mealsPerWeek: plan.meals_per_week,
      price: Number(plan.price),
      description: plan.description,
      mealType: plan.meal_type,
      isVegetarian: plan.is_vegetarian,
    })),
    reviews: [],
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    isDemo: false,
  };
}

async function signKitchenPhotos(photos: KitchenPhotoRow[]) {
  if (!photos.length) return photos;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("kitchen-images")
    .createSignedUrls(
      photos.map((photo) => photo.storage_path),
      600,
    );

  if (error || !data) {
    return photos.map((photo) => ({ ...photo, image_url: "" }));
  }

  const signedByPath = new Map(
    data.flatMap((entry) =>
      entry.signedUrl && entry.path ? [[entry.path, entry.signedUrl] as const] : [],
    ),
  );

  return photos.map((photo) => ({
    ...photo,
    image_url: signedByPath.get(photo.storage_path) ?? "",
  }));
}

async function getRelatedData(kitchens: KitchenRow[]): Promise<RelatedData | null> {
  if (!kitchens.length) return { photos: [], plans: [], menus: [], areas: [] };
  const ids = kitchens.map((kitchen) => kitchen.id);
  const supabase = await createClient();
  const [photosResult, plansResult, menusResult, areasResult] = await Promise.all([
    supabase.from("kitchen_photos").select("*").in("kitchen_id", ids).order("display_order"),
    supabase.from("subscription_plans").select("*").in("kitchen_id", ids).eq("is_active", true),
    supabase.from("menu_posts").select("*").in("kitchen_id", ids).eq("is_published", true),
    supabase.from("kitchen_service_areas").select("kitchen_id,sector,is_active").in("kitchen_id", ids).eq("is_active", true),
  ]);
  if (photosResult.error || plansResult.error || menusResult.error || areasResult.error) {
    return null;
  }

  const photos = await signKitchenPhotos(photosResult.data);
  return {
    photos,
    plans: plansResult.data,
    menus: menusResult.data,
    areas: areasResult.data,
  };
}

export async function getPublicKitchens(): Promise<MarketplaceResult<Kitchen[]>> {
  if (!isSupabaseConfigured()) return { status: "unconfigured" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kitchens")
    .select("*")
    .eq("approval_status", "approved")
    .eq("is_listed", true)
    .order("created_at", { ascending: false });

  if (error || !data) return { status: "error" };
  const related = await getRelatedData(data);
  if (!related) return { status: "error" };
  return { status: "live", data: data.map((row) => toKitchen(row, related)) };
}

export async function getPublicKitchenBySlug(
  slug: string,
): Promise<MarketplaceResult<Kitchen | null>> {
  if (!isSupabaseConfigured()) return { status: "unconfigured" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kitchens")
    .select("*")
    .eq("slug", slug)
    .eq("approval_status", "approved")
    .eq("is_listed", true)
    .maybeSingle();

  if (error) return { status: "error" };
  if (!data) return { status: "live", data: null };
  const related = await getRelatedData([data]);
  if (!related) return { status: "error" };
  return { status: "live", data: toKitchen(data, related) };
}
