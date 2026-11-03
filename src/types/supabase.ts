import type { AppRole } from "@/types/navigation";

type Table<Row, Insert, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type ProfileRow = {
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

export type CustomerRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired";

export type CustomerRequestRow = {
  id: string;
  customer_id: string;
  kitchen_id: string;
  preferred_meal: string;
  preferred_start_date: string;
  message: string | null;
  consent_given: boolean;
  contact_sharing_consent: boolean;
  contact_sharing_consent_at: string | null;
  status: CustomerRequestStatus;
  accepted_at: string | null;
  rejected_at: string | null;
  withdrawn_at: string | null;
  activated_at: string | null;
  customer_name: string;
  kitchen_name: string;
  kitchen_photo_path: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationRow = {
  id: string;
  recipient_id: string;
  request_id: string | null;
  notification_type:
    | "request_submitted"
    | "request_received"
    | "request_accepted"
    | "request_rejected"
    | "request_withdrawn"
    | "customer_activated"
    | "provider_activation_paid";
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type ActivationPaymentStatus =
  | "created"
  | "pending"
  | "success"
  | "failed"
  | "refunded";

export type ActivationPaymentRow = {
  id: string;
  request_id: string;
  kitchen_id: string;
  customer_id: string;
  provider_id: string;
  customer_name: string;
  kitchen_name: string;
  amount_paise: number;
  currency: string;
  status: ActivationPaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  activation_applied: boolean;
  paid_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type KitchenCustomerRow = {
  id: string;
  kitchen_id: string;
  customer_id: string;
  request_id: string;
  activation_payment_id: string;
  kitchen_name: string;
  activated_at: string;
};

export type ProviderActivatedCustomer = {
  kitchen_customer_id: string;
  kitchen_id: string;
  request_id: string;
  kitchen_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  preferred_meal: string;
  preferred_start_date: string;
  request_message: string | null;
  activated_at: string;
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
      customer_requests: Table<
        CustomerRequestRow,
        Omit<CustomerRequestRow, "id" | "created_at" | "updated_at" | "activated_at"> &
          Partial<Pick<CustomerRequestRow, "id" | "created_at" | "updated_at" | "activated_at">>
      >;
      notifications: Table<
        NotificationRow,
        Omit<NotificationRow, "id" | "created_at"> &
          Partial<Pick<NotificationRow, "id" | "created_at">>
      >;
      activation_payments: Table<
        ActivationPaymentRow,
        Omit<ActivationPaymentRow, "id" | "created_at" | "updated_at" | "paid_at" | "failed_at" | "razorpay_order_id" | "razorpay_payment_id" | "activation_applied"> &
          Partial<Pick<ActivationPaymentRow, "id" | "created_at" | "updated_at" | "paid_at" | "failed_at" | "razorpay_order_id" | "razorpay_payment_id" | "activation_applied">>
      >;
      kitchen_customers: Table<
        KitchenCustomerRow,
        Omit<KitchenCustomerRow, "id" | "activated_at"> &
          Partial<Pick<KitchenCustomerRow, "id" | "activated_at">>
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
      submit_customer_request: {
        Args: {
          p_kitchen_id: string;
          p_preferred_meal: string;
          p_preferred_start_date: string;
          p_message: string | null;
          p_consent_given: boolean;
          p_contact_sharing_consent: boolean;
        };
        Returns: string;
      };
      authorize_customer_contact_sharing: {
        Args: { p_request_id: string };
        Returns: undefined;
      };
      withdraw_customer_request: {
        Args: { p_request_id: string };
        Returns: undefined;
      };
      respond_to_customer_request: {
        Args: { p_request_id: string; p_decision: string };
        Returns: undefined;
      };
      decline_accepted_customer_request: {
        Args: { p_request_id: string };
        Returns: undefined;
      };
      reserve_activation_payment: {
        Args: { p_request_id: string; p_claim_token: string };
        Returns: {
          payment_id: string;
          razorpay_order_id: string | null;
          should_create_order: boolean;
          payment_status: string;
        }[];
      };
      attach_activation_order: {
        Args: {
          p_payment_id: string;
          p_claim_token: string;
          p_razorpay_order_id: string;
        };
        Returns: boolean;
      };
      confirm_activation_payment: {
        Args: {
          p_razorpay_order_id: string;
          p_razorpay_payment_id: string;
          p_amount_paise: number;
          p_currency: string;
        };
        Returns: string;
      };
      fail_activation_payment: {
        Args: {
          p_razorpay_order_id: string;
          p_amount_paise: number;
          p_currency: string;
        };
        Returns: string;
      };
      get_provider_activated_customers: {
        Args: Record<string, never>;
        Returns: ProviderActivatedCustomer[];
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
