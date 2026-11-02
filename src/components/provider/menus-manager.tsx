"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteMenuPostAction, saveMenuPostAction } from "@/services/marketplace/provider-actions";
import type { MenuPostRow } from "@/types/supabase";

function todayDate() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  return parts;
}

const blankMenu = (): {
  menuDate: string;
  mealType: "breakfast" | "lunch" | "dinner";
  title: string;
  description: string;
  imageUrl: string;
  isPublished: boolean;
} => ({
  menuDate: todayDate(),
  mealType: "lunch" as const,
  title: "",
  description: "",
  imageUrl: "",
  isPublished: true,
});

export function MenusManager({ menus }: { menus: MenuPostRow[] }) {
  const [values, setValues] = useState(blankMenu);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [busy, startTransition] = useTransition();

  function edit(menu: MenuPostRow) {
    setEditingId(menu.id);
    setValues({
      menuDate: menu.menu_date,
      mealType: menu.meal_type,
      title: menu.title,
      description: menu.description,
      imageUrl: menu.image_url ?? "",
      isPublished: menu.is_published,
    });
    document.getElementById("menu-title")?.focus();
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveMenuPostAction({ ...values, id: editingId });
      setMessage(result.success ? "Menu saved." : result.message);
      if (result.success) window.location.reload();
    });
  }

  const today = todayDate();
  const todaysMenus = menus.filter((menu) => menu.menu_date === today);
  const upcoming = menus.filter((menu) => menu.menu_date > today);
  const previous = menus.filter((menu) => menu.menu_date < today);

  return (
    <div className="provider-manager-grid">
      <form className="provider-form-card space-y-4" onSubmit={save}>
        <div><p className="section-kicker">DAILY MENU</p><h2 className="mt-1 text-xl font-black">{editingId ? "Edit your menu." : "What’s cooking today?"}</h2></div>
        <label className="form-field">Menu date<input required type="date" value={values.menuDate} onChange={(event) => setValues({ ...values, menuDate: event.target.value })} /></label>
        <label className="form-field">Meal<select value={values.mealType} onChange={(event) => setValues({ ...values, mealType: event.target.value as typeof values.mealType })}><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option></select></label>
        <label className="form-field">Menu title<input id="menu-title" required minLength={2} maxLength={100} value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} placeholder="Today's ghar ka lunch" /></label>
        <label className="form-field">What&apos;s included?<textarea required minLength={10} maxLength={2000} rows={5} value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} placeholder="Dal, seasonal sabzi, phulkas…" /></label>
        <label className="form-field">Optional menu photo URL<input type="url" maxLength={2048} value={values.imageUrl} onChange={(event) => setValues({ ...values, imageUrl: event.target.value })} placeholder="https://…" /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={values.isPublished} onChange={(event) => setValues({ ...values, isPublished: event.target.checked })} /> Publish this menu to customers</label>
        {message ? <p className="text-sm" role="status">{message}</p> : null}
        <div className="flex flex-wrap gap-2"><button className="form-primary" type="submit" disabled={busy}><Plus size={16} />{editingId ? "Save menu" : "Publish menu"}</button>{editingId ? <button type="button" className="form-secondary" onClick={() => { setEditingId(undefined); setValues(blankMenu()); }}>Cancel</button> : null}</div>
      </form>

      <section className="space-y-5">
        <div><p className="section-kicker">ON YOUR CALENDAR</p><h2 className="mt-1 text-xl font-black">Menu moments</h2></div>
        {[
          ["Today", todaysMenus],
          ["Coming up", upcoming],
          ["Previously served", previous],
        ].map(([label, items]) => (
          <div key={label as string} className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-black"><CalendarDays size={15} />{label as string}</h3>
            {(items as MenuPostRow[]).length ? (items as MenuPostRow[]).map((menu) => (
              <article className="provider-list-card" key={menu.id}>
                <div className="flex items-start justify-between gap-3"><div><span className={`kitchen-status ${menu.is_published ? "status-approved" : "status-draft"}`}>{menu.is_published ? "published" : "draft"}</span><h4>{menu.title}</h4><p>{menu.menu_date} · {menu.meal_type}</p></div><div className="flex gap-1"><button type="button" className="provider-icon-button" aria-label={`Edit ${menu.title}`} onClick={() => edit(menu)}><Pencil size={15} /></button><button type="button" className="provider-icon-button provider-danger-button" aria-label={`Delete ${menu.title}`} onClick={() => { if (window.confirm(`Delete “${menu.title}”?`)) startTransition(async () => { const result = await deleteMenuPostAction(menu.id); setMessage(result.success ? "Menu deleted." : result.message); if (result.success) window.location.reload(); }); }}><Trash2 size={15} /></button></div></div>
                <p className="mt-3 text-sm text-muted-foreground">{menu.description}</p>
              </article>
            )) : <p className="text-sm text-muted-foreground">Nothing on the calendar here yet.</p>}
          </div>
        ))}
        <p className="rounded-xl bg-[#e9f8c8] px-4 py-3 text-xs leading-5 text-[#37431e]">Customers can browse menus for approved kitchens. Food arrangements and payments stay directly between you and the customer.</p>
      </section>
    </div>
  );
}
