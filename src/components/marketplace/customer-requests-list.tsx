"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Clock3, MapPin, X } from "lucide-react";
import { KitchenImage } from "@/components/marketplace/kitchen-image";
import { withdrawCustomerRequestAction } from "@/services/marketplace/request-actions";
import type { RequestListItem } from "@/services/marketplace/request-queries";
import type { CustomerRequestStatus } from "@/types/supabase";

const statusCopy: Record<CustomerRequestStatus, { title: string; detail: string }> = {
  pending: { title: "Waiting on the kitchen", detail: "They’ll review your request and get back to you here." },
  accepted: { title: "Accepted · awaiting activation", detail: "The kitchen is interested. Activation is the next step; no payment or subscription has been created." },
  rejected: { title: "Not available right now", detail: "This kitchen couldn’t take on the request. Your next food obsession might be elsewhere." },
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
              <p className="mt-2 text-sm font-bold">{status.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{status.detail}</p>
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
