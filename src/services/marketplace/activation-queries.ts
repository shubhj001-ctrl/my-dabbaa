import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  ActivationPaymentRow,
  ProviderActivatedCustomer,
} from "@/types/supabase";

export async function getProviderActivationPayments(): Promise<
  { status: "live"; payments: ActivationPaymentRow[] } | { status: "error" }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activation_payments")
    .select(
      "id,request_id,kitchen_id,customer_id,provider_id,customer_name,kitchen_name,amount_paise,currency,status,razorpay_order_id,razorpay_payment_id,activation_applied,paid_at,failed_at,created_at,updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load provider activation payments:", error.code);
    return { status: "error" };
  }
  return { status: "live", payments: data };
}

export async function getProviderActivatedCustomers(): Promise<
  { status: "live"; customers: ProviderActivatedCustomer[] } | { status: "error" }
> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_provider_activated_customers");
  if (error) {
    console.error("Unable to load activated customer details:", error.code);
    return { status: "error" };
  }
  return { status: "live", customers: data };
}
