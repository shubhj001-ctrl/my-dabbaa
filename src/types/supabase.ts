import type { AppRole } from "@/types/navigation";

type Table<Row, Insert, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: AppRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type KitchenApprovalStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";
export type KitchenFoodType = "vegetarian" | "non_vegetarian" | "both";
export type KitchenPreparationType =
  | "homemade"
  | "cloud_kitchen"
  | "tiffin_service";
export type KitchenPhotoType = "kitchen" | "food";
export type KitchenMealType = "breakfast" | "lunch" | "dinner";

export type KitchenRow = {
  id: string;
  owner_id: string;
  kitchen_name: string;
  contact_name: string;
  slug: string;
  description: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  city: string;
  sector: string;
  pincode: string;
  cuisine_types: string[];
  food_type: KitchenFoodType;
  preparation_type: KitchenPreparationType;
  meal_categories: KitchenMealType[];
  avg_daily_capacity: number;
  operating_days: string[];
  opening_time: string;
  closing_time: string;
  approval_status: KitchenApprovalStatus;
  rejection_reason: string | null;
  is_listed: boolean;
  created_at: string;
  updated_at: string;
};

export type KitchenServiceAreaRow = {
  id: string;
  kitchen_id: string;
  sector: string;
  pincode: string;
  locality: string | null;
  is_active: boolean;
  created_at: string;
};

export type KitchenPhotoRow = {
  id: string;
  kitchen_id: string;
  image_url: string;
  storage_path: string;
  image_type: KitchenPhotoType;
  display_order: number;
  created_at: string;
};

export type SubscriptionPlanRow = {
  id: string;
  kitchen_id: string;
  plan_name: string;
  description: string;
  meal_type: KitchenMealType;
  price: number;
  duration_days: number;
  meals_per_week: number;
  is_vegetarian: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MenuPostRow = {
  id: string;
  kitchen_id: string;
  menu_date: string;
  meal_type: KitchenMealType;
  title: string;
  description: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type KitchenInsert = Omit<
  KitchenRow,
  | "id"
  | "approval_status"
  | "rejection_reason"
  | "is_listed"
  | "created_at"
  | "updated_at"
> &
  Partial<
    Pick<
      KitchenRow,
      | "id"
      | "approval_status"
      | "rejection_reason"
      | "is_listed"
      | "created_at"
      | "updated_at"
    >
  >;

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Omit<ProfileRow, "created_at" | "updated_at"> &
          Partial<Pick<ProfileRow, "created_at" | "updated_at">>
      >;
      kitchens: Table<KitchenRow, KitchenInsert>;
      kitchen_service_areas: Table<
        KitchenServiceAreaRow,
        Omit<KitchenServiceAreaRow, "id" | "created_at"> &
          Partial<Pick<KitchenServiceAreaRow, "id" | "created_at">>
      >;
      kitchen_photos: Table<
        KitchenPhotoRow,
        Omit<KitchenPhotoRow, "id" | "created_at"> &
          Partial<Pick<KitchenPhotoRow, "id" | "created_at">>
      >;
      subscription_plans: Table<
        SubscriptionPlanRow,
        Omit<SubscriptionPlanRow, "id" | "created_at" | "updated_at" | "is_active"> &
          Partial<
            Pick<SubscriptionPlanRow, "id" | "created_at" | "updated_at" | "is_active">
          >
      >;
      menu_posts: Table<
        MenuPostRow,
        Omit<MenuPostRow, "id" | "created_at" | "updated_at"> &
          Partial<Pick<MenuPostRow, "id" | "created_at" | "updated_at">>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_trusted_admin: { Args: Record<string, never>; Returns: boolean };
      is_marketplace_admin: { Args: Record<string, never>; Returns: boolean };
      is_active_provider: { Args: Record<string, never>; Returns: boolean };
      submit_kitchen_application: {
        Args: { p_kitchen_id: string };
        Returns: undefined;
      };
      review_kitchen: {
        Args: {
          p_kitchen_id: string;
          p_decision: KitchenApprovalStatus;
          p_reason?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: AppRole;
      kitchen_approval_status: KitchenApprovalStatus;
      kitchen_food_type: KitchenFoodType;
      kitchen_preparation_type: KitchenPreparationType;
      kitchen_photo_type: KitchenPhotoType;
      kitchen_meal_type: KitchenMealType;
    };
    CompositeTypes: Record<string, never>;
  };
};
