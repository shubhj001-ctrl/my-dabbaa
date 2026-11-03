"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Clock3, MapPin, X } from "lucide-react";
import { KitchenImage } from "@/components/marketplace/kitchen-image";
import {
  authorizeCustomerContactSharingAction,
  withdrawCustomerRequestAction,
} from "@/services/marketplace/request-actions";
import type { RequestListItem } from "@/services/marketplace/request-queries";
import type { CustomerRequestStatus } from "@/types/supabase";

const statusCopy: Record<CustomerRequestStatus, { title: string; detail: string }> = {
  pending: { title: "Waiting on the kitchen", detail: "They’ll review your request and get back to you here." },
  accepted: { title: "Accepted · awaiting activation", detail: "The kitchen is interested. The provider will pay the one-time activation fee; no food payment or subscription is created here." },
  rejected: { title: "Request declined", detail: "This kitchen can’t take on the request right now. You can send a new request to this kitchen later or explore another kitchen." },
  withdrawn: { title: "Request withdrawn", detail: "This request is closed. You can send a new one if your plans change." },
  expired: { title: "Request expired", detail: "This request is no longer active. Explore kitchens to find another match." },
};

const mealLabel: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  multiple: "Multiple meals",
};

export function CustomerRequestsList({ requests }: { requests: RequestListItem[] }) {
  const [items, setItems] = useState(requests);
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  function withdraw(requestId: string) {
    setNotice("");
    startTransition(async () => {
      const result = await withdrawCustomerRequestAction({ requestId });
      if (!result.success) {
        setNotice(result.message);
        return;
      }
      setItems((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, status: "withdrawn", withdrawn_at: new Date().toISOString() }
            : request,
        ),
      );
    });
  }

  function authorizeContactSharing(requestId: string) {
    setNotice("");
    startTransition(async () => {
      const result = await authorizeCustomerContactSharingAction({ requestId });
      if (!result.success) {
        setNotice(result.message);
        return;
      }
      setItems((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, contact_sharing_consent: true }
            : request,
        ),
      );
    });
  }

  if (!items.length) {
    return (
      <section className="provider-empty-card">
        <span className="provider-empty-icon">✳</span>
        <h2>Nothing cooking here yet!</h2>
        <p>Your kitchen requests and their updates will show up here.</p>
        <a className="form-primary" href="/explore">Explore kitchens</a>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {notice ? <p className="request-form-error" role="alert">{notice}</p> : null}
      {items.map((request) => {
        const status = statusCopy[request.status];
        return (
          <article className={`customer-request-card request-${request.status}`} key={request.id}>
            <div className="request-card-image">
              <KitchenImage src={request.photo_url} alt={`${request.kitchen_name} food`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2>{request.kitchen_name}</h2>
                <span className={`request-status status-${request.status}`}>{request.status}</span>
              </div>
              <p className="mt-2 text-sm font-bold">{request.activated_at ? "Customer profile activated" : status.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{request.activated_at ? "The kitchen will configure your food subscription with you next." : status.detail}</p>
              {request.activated_at ? (
                <p className="mt-3 rounded-xl bg-[#eaf4df] px-4 py-3 text-sm leading-6 text-[#315b43]">
                  <b>Your customer profile is activated.</b> {request.kitchen_name} will configure your food subscription with you next. No subscription has been marked active yet.
                </p>
              ) : null}
              {request.status === "accepted" && !request.activated_at && !request.contact_sharing_consent ? (
                <div className="mt-4 rounded-xl border border-border bg-white/70 p-4">
                  <p className="text-sm leading-6">
                    This request was sent before contact-sharing consent was added. If you want to proceed, authorize the kitchen to receive your full name, email, and phone only after its activation payment is verified.
                  </p>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => authorizeContactSharing(request.id)}
                    className="button-pop button-lime mt-3 min-h-10 disabled:opacity-60"
                  >
                    I authorize contact sharing after activation
                  </button>
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> Start {request.preferred_start_date}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {mealLabel[request.preferred_meal] ?? request.preferred_meal}</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> Sent {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(request.created_at))}</span>
              </div>
              {request.message ? <p className="mt-3 rounded-xl bg-white/70 p-3 text-sm leading-6"><b>Your note:</b> {request.message}</p> : null}
              {request.status === "pending" ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => withdraw(request.id)}
                  className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold hover:bg-white disabled:opacity-60"
                >
                  <X size={15} /> Withdraw request
                </button>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
