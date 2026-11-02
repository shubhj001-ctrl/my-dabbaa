import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/supabase";

const serviceRoleKeySchema = z.string().min(1);

export function createAdminClient() {
  const { url } = getPublicSupabaseEnv();
  const serviceRoleKey = serviceRoleKeySchema.parse(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function isSupabaseServiceRoleConfigured() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
