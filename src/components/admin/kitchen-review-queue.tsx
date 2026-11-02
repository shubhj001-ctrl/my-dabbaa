"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { BadgeCheck, Ban, Check, Clock3, X } from "lucide-react";
import { reviewKitchenAction } from "@/services/marketplace/admin-actions";
import type { ReviewApplication } from "@/services/marketplace/admin-queries";

export function KitchenReviewQueue({
  applications,
}: {
  applications: ReviewApplication[];
}) {
  const [reasonById, setReasonById] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [busy, startTransition] = useTransition();

  function review(kitchenId: string, decision: "approved" | "rejected" | "suspended") {
    startTransition(async () => {
      const result = await reviewKitchenAction({
        kitchenId,
        decision,
        reason: reasonById[kitchenId] ?? "",
      });
      setFeedback((current) => ({ ...current, [kitchenId]: result.message }));
      if (result.success) window.location.reload();
    });
  }

  return (
    <div className="space-y-5">
      {applications.map(({ kitchen, photos, serviceAreas, providerName }) => (
        <article className="admin-kitchen-card" key={kitchen.id}>
          <div className="admin-kitchen-head">
            <div>
              <span className={`kitchen-status status-${kitchen.approval_status}`}>{kitchen.approval_status}</span>
              <h2>{kitchen.kitchen_name}</h2>
              <p>{providerName} · {kitchen.created_at.slice(0, 10)}</p>
            </div>
            {kitchen.approval_status === "pending" ? <span className="admin-review-mark"><Clock3 size={14} /> NEEDS A LOOK</span> : <span className="admin-approved-mark"><BadgeCheck size={15} /> LIVE LISTING</span>}
          </div>
          <div className="admin-kitchen-grid">
            <div className="admin-kitchen-details">
              <p>{kitchen.description}</p>
              <dl className="admin-details-list">
                <div><dt>Contact</dt><dd>{kitchen.contact_name} · <a href={`tel:${kitchen.contact_phone}`}>{kitchen.contact_phone}</a></dd></div>
                <div><dt>Email</dt><dd><a href={`mailto:${kitchen.contact_email}`}>{kitchen.contact_email}</a></dd></div>
                <div><dt>Address</dt><dd>{kitchen.address}, {kitchen.sector}, Chandigarh {kitchen.pincode}</dd></div>
                <div><dt>Food</dt><dd>{kitchen.cuisine_types.join(", ")} · {kitchen.food_type.replaceAll("_", " ")}</dd></div>
                <div><dt>Meals</dt><dd>{kitchen.meal_categories.join(", ")} · {kitchen.preparation_type.replaceAll("_", " ")}</dd></div>
                <div><dt>Service areas</dt><dd className="inline-flex flex-wrap gap-1">{serviceAreas.filter((area) => area.is_active).map((area) => <span className="admin-area-tag" key={area.id}>{area.sector}</span>)}</dd></div>
              </dl>
            </div>
            <div>
              <h3 className="admin-subhead">Kitchen & food photos</h3>
              {photos.length ? (
                <div className="admin-photo-grid">
                  {photos.map((photo) => (
                    <a href={photo.signed_url || undefined} target="_blank" rel="noreferrer" key={photo.id} className="admin-photo">
                      {photo.signed_url ? <Image src={photo.signed_url} alt={`${photo.image_type} photo for ${kitchen.kitchen_name}`} fill unoptimized className="object-cover" /> : <span>Image unavailable</span>}
                      <small>{photo.image_type}</small>
                    </a>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No photos attached.</p>}
            </div>
          </div>
          {kitchen.approval_status === "pending" ? (
            <div className="admin-review-actions">
              <label className="form-field">Rejection feedback (required only when rejecting)
                <textarea value={reasonById[kitchen.id] ?? ""} onChange={(event) => setReasonById((current) => ({ ...current, [kitchen.id]: event.target.value }))} rows={2} maxLength={1000} placeholder="Share a helpful reason the provider can act on." />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={() => review(kitchen.id, "approved")} className="admin-action-approve"><Check size={15} /> Approve & list</button>
                <button type="button" disabled={busy} onClick={() => review(kitchen.id, "rejected")} className="admin-action-reject"><X size={15} /> Reject</button>
              </div>
              {feedback[kitchen.id] ? <p role="status" className="text-sm text-[#7b2c25]">{feedback[kitchen.id]}</p> : null}
            </div>
          ) : (
            <div className="admin-review-actions admin-suspend-row">
              <p>This kitchen is currently visible in Explore.</p>
              <button type="button" disabled={busy} onClick={() => review(kitchen.id, "suspended")} className="admin-action-reject"><Ban size={15} /> Suspend listing</button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
