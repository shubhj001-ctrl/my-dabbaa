import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { CustomerRequestRow, NotificationRow } from "@/types/supabase";

type RequestDisplayFields = Pick<
  CustomerRequestRow,
  | "id"
  | "preferred_meal"
  | "preferred_start_date"
  | "message"
  | "consent_given"
  | "contact_sharing_consent"
  | "status"
  | "accepted_at"
  | "rejected_at"
  | "withdrawn_at"
  | "activated_at"
  | "customer_name"
  | "kitchen_name"
  | "kitchen_photo_path"
  | "created_at"
  | "updated_at"
>;

export type RequestListItem = RequestDisplayFields & { photo_url: string };
export type RequestNotification = Pick<
  NotificationRow,
  "id" | "notification_type" | "title" | "body" | "read_at" | "created_at"
>;

export type CustomerRequestsResult =
  | { status: "live"; requests: RequestListItem[]; notifications: RequestNotification[] }
  | { status: "unconfigured" }
  | { status: "error" };

export type ProviderRequestsResult =
  | {
      status: "live";
      requests: RequestListItem[];
      notifications: RequestNotification[];
    }
  | { status: "unconfigured" }
  | { status: "error" };

async function signedRequestPhotos(rows: RequestDisplayFields[]) {
  const paths = [...new Set(rows.flatMap((row) => row.kitchen_photo_path ?? []))];
  if (!paths.length) return new Map<string, string>();

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("kitchen-images")
    .createSignedUrls(paths, 600);
  if (error || !data) return new Map<string, string>();

  return new Map(
    data.flatMap((entry) =>
      entry.signedUrl && entry.path ? [[entry.path, entry.signedUrl] as const] : [],
    ),
  );
}

async function attachPhotos(rows: RequestDisplayFields[]): Promise<RequestListItem[]> {
  const signedByPath = await signedRequestPhotos(rows);
  return rows.map((row) => ({
    ...row,
    photo_url: row.kitchen_photo_path
      ? signedByPath.get(row.kitchen_photo_path) ?? ""
      : "",
  }));
}

async function getNotifications() {
  const supabase = await createClient();
  return supabase
    .from("notifications")
    .select("id,notification_type,title,body,read_at,created_at")
    .order("created_at", { ascending: false })
    .limit(10);
}

export async function getCustomerRequests(): Promise<CustomerRequestsResult> {
  if (!isSupabaseConfigured()) return { status: "unconfigured" };

  const supabase = await createClient();
  const [requestsResult, notificationsResult] = await Promise.all([
    supabase
      .from("customer_requests")
        .select("id,preferred_meal,preferred_start_date,message,consent_given,contact_sharing_consent,status,accepted_at,rejected_at,withdrawn_at,activated_at,customer_name,kitchen_name,kitchen_photo_path,created_at,updated_at")
      .order("created_at", { ascending: false }),
    getNotifications(),
  ]);
  if (requestsResult.error || notificationsResult.error) return { status: "error" };

  return {
    status: "live",
    requests: await attachPhotos(requestsResult.data),
    notifications: notificationsResult.data,
  };
}

export async function getProviderRequests(): Promise<ProviderRequestsResult> {
  if (!isSupabaseConfigured()) return { status: "unconfigured" };

  const supabase = await createClient();
  const [requestsResult, notificationsResult] = await Promise.all([
    supabase
      .from("customer_requests")
      .select("id,preferred_meal,preferred_start_date,message,consent_given,contact_sharing_consent,status,accepted_at,rejected_at,withdrawn_at,activated_at,customer_name,kitchen_name,kitchen_photo_path,created_at,updated_at")
      .order("created_at", { ascending: false }),
    getNotifications(),
  ]);
  if (requestsResult.error || notificationsResult.error) return { status: "error" };

  return {
    status: "live",
    requests: await attachPhotos(requestsResult.data),
    notifications: notificationsResult.data,
  };
}
