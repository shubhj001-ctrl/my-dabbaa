"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Check, Clock3, MapPin, X } from "lucide-react";
import { KitchenImage } from "@/components/marketplace/kitchen-image";
import { respondToCustomerRequestAction } from "@/services/marketplace/request-actions";
import type { RequestListItem } from "@/services/marketplace/request-queries";
import type { CustomerRequestStatus } from "@/types/supabase";

const mealLabel: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  multiple: "Multiple meals",
};

const statusMessage: Record<CustomerRequestStatus, string> = {
  pending: "Review the meal preference and timing. Customer contact information stays private.",
  accepted: "Accepted · awaiting activation. No payment has been taken and no customer contact details have been unlocked.",
  rejected: "This request was declined; the customer has been notified.",
  withdrawn: "The customer withdrew this request.",
  expired: "This request has expired.",
};

export function ProviderRequestsList({ requests }: { requests: RequestListItem[] }) {
  const [items, setItems] = useState(requests);
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  function respond(requestId: string, decision: "accepted" | "rejected") {
    setNotice("");
    startTransition(async () => {
      const result = await respondToCustomerRequestAction({ requestId, decision });
      if (!result.success) {
        setNotice(result.message);
        return;
      }
      const timestamp = new Date().toISOString();
      setItems((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: decision,
                accepted_at: decision === "accepted" ? timestamp : null,
                rejected_at: decision === "rejected" ? timestamp : null,
              }
            : request,
        ),
      );
    });
  }

  if (!items.length) {
    return (
      <section className="provider-empty-card">
        <span className="provider-empty-icon">✳</span>
        <h2>No requests on the table yet.</h2>
        <p>Customer enquiries for your kitchens will appear here. Only the name and request details they authorize are shown.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {notice ? <p className="request-form-error" role="alert">{notice}</p> : null}
      {items.map((request) => (
        <article className={`provider-request-card request-${request.status}`} key={request.id}>
          <div className="request-card-image">
            <KitchenImage src={request.photo_url} alt={`${request.kitchen_name} food`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="request-status status-neutral">{request.kitchen_name}</span>
              <span className={`request-status status-${request.status}`}>{request.status}</span>
            </div>
            <h2 className="mt-3">{request.customer_name}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{statusMessage[request.status]}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {mealLabel[request.preferred_meal] ?? request.preferred_meal}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> Wants to start {request.preferred_start_date}</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> Received {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(request.created_at))}</span>
            </div>
            {request.message ? <p className="mt-3 rounded-xl bg-white/70 p-3 text-sm leading-6"><b>Customer note:</b> {request.message}</p> : null}
            {request.consent_given ? <p className="mt-3 text-xs font-medium text-muted-foreground">Customer consented to share necessary request details. Phone and email remain private.</p> : null}
            {request.status === "pending" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" disabled={isPending} onClick={() => respond(request.id, "accepted")} className="button-pop button-lime min-h-10">
                  <Check size={15} /> Accept · free
                </button>
                <button type="button" disabled={isPending} onClick={() => respond(request.id, "rejected")} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold hover:bg-white disabled:opacity-60">
                  <X size={15} /> Decline
                </button>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
