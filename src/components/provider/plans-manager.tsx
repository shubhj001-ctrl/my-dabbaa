"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { deletePlanAction, savePlanAction, setPlanActiveAction } from "@/services/marketplace/provider-actions";
import type { SubscriptionPlanRow } from "@/types/supabase";

const blankPlan: {
  planName: string;
  description: string;
  mealType: "breakfast" | "lunch" | "dinner";
  price: string;
  durationDays: string;
  mealsPerWeek: string;
  isVegetarian: boolean;
} = {
  planName: "",
  description: "",
  mealType: "lunch" as const,
  price: "",
  durationDays: "20",
  mealsPerWeek: "5",
  isVegetarian: true,
};

export function PlansManager({ plans }: { plans: SubscriptionPlanRow[] }) {
  const [values, setValues] = useState(blankPlan);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [busy, startTransition] = useTransition();

  function edit(plan: SubscriptionPlanRow) {
    setEditingId(plan.id);
    setValues({
      planName: plan.plan_name,
      description: plan.description,
      mealType: plan.meal_type,
      price: String(plan.price),
      durationDays: String(plan.duration_days),
      mealsPerWeek: String(plan.meals_per_week),
      isVegetarian: plan.is_vegetarian,
    });
    document.getElementById("plan-name")?.focus();
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await savePlanAction({ ...values, id: editingId });
      setMessage(result.success ? "Plan saved. Customers pay you directly." : result.message);
      if (result.success) {
        setEditingId(undefined);
        setValues(blankPlan);
        window.location.reload();
      }
    });
  }

  return (
    <div className="provider-manager-grid">
      <form className="provider-form-card space-y-4" onSubmit={save}>
        <div><p className="section-kicker">INFORMATIONAL ONLY · NO PLATFORM PAYMENTS</p><h2 className="mt-1 text-xl font-black">{editingId ? "Edit this plan" : "Put a meal plan together."}</h2></div>
        <label className="form-field">Plan name<input id="plan-name" required minLength={2} maxLength={80} value={values.planName} onChange={(event) => setValues({ ...values, planName: event.target.value })} placeholder="Weekday lunch" /></label>
        <label className="form-field">Description<textarea required minLength={10} maxLength={500} rows={3} value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} placeholder="What does this plan include?" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="form-field">Meal type<select value={values.mealType} onChange={(event) => setValues({ ...values, mealType: event.target.value as typeof values.mealType })}><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option></select></label>
          <label className="form-field">Price (₹)<input required type="number" min="1" max="100000" step="1" value={values.price} onChange={(event) => setValues({ ...values, price: event.target.value })} /></label>
          <label className="form-field">Plan duration (days)<input required type="number" min="1" max="365" value={values.durationDays} onChange={(event) => setValues({ ...values, durationDays: event.target.value })} /></label>
          <label className="form-field">Meals per week<input required type="number" min="1" max="21" value={values.mealsPerWeek} onChange={(event) => setValues({ ...values, mealsPerWeek: event.target.value })} /></label>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={values.isVegetarian} onChange={(event) => setValues({ ...values, isVegetarian: event.target.checked })} /> Vegetarian plan</label>
        {message ? <p className="text-sm" role="status">{message}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button className="form-primary" type="submit" disabled={busy}>{editingId ? <Check size={16} /> : <Plus size={16} />}{editingId ? "Save changes" : "Add plan"}</button>
          {editingId ? <button className="form-secondary" type="button" onClick={() => { setEditingId(undefined); setValues(blankPlan); }}>Cancel</button> : null}
        </div>
      </form>

      <section className="space-y-3">
        <div><p className="section-kicker">YOUR OPTIONS</p><h2 className="mt-1 text-xl font-black">Plans for the table</h2></div>
        {plans.length ? plans.map((plan) => (
          <article className="provider-list-card" key={plan.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><span className={`kitchen-status ${plan.is_active ? "status-approved" : "status-draft"}`}>{plan.is_active ? "active" : "hidden"}</span><h3>{plan.plan_name}</h3><p>{plan.meal_type} · {plan.duration_days} days · {plan.meals_per_week} meals/week</p></div>
              <strong>₹{Number(plan.price).toLocaleString("en-IN")}</strong>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="provider-small-button" onClick={() => edit(plan)}><Pencil size={14} /> Edit</button>
              <button type="button" disabled={busy} className="provider-small-button" onClick={() => startTransition(async () => { const result = await setPlanActiveAction(plan.id, !plan.is_active); setMessage(result.success ? "Plan visibility updated." : result.message); if (result.success) window.location.reload(); })}>{plan.is_active ? "Deactivate" : "Activate"}</button>
              <button type="button" disabled={busy} className="provider-small-button provider-danger-button" onClick={() => { if (window.confirm("Delete this plan? Customers arrange all meal payments directly with you.")) startTransition(async () => { const result = await deletePlanAction(plan.id); setMessage(result.success ? "Plan deleted." : result.message); if (result.success) window.location.reload(); }); }}><Trash2 size={14} /> Delete</button>
            </div>
          </article>
        )) : <div className="provider-empty-card"><span className="provider-empty-icon">₹</span><h3>No plans on the menu.</h3><p>Your plans are just information. Customers always pay you directly.</p></div>}
        <p className="rounded-xl bg-[#fff2c8] px-4 py-3 text-xs leading-5 text-[#51421e]">Dabbaa does not collect food subscription payments. Share clear prices; arrange payment and delivery directly with customers.</p>
      </section>
    </div>
  );
}
