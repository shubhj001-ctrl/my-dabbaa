"use client";

import { useMemo, useState } from "react";
import { Search, UsersRound } from "lucide-react";
import type { AdminCustomer } from "@/services/marketplace/admin-queries";

export function AdminCustomerDirectory({ customers }: { customers: AdminCustomer[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en-IN");
    if (!normalized) return customers;
    return customers.filter((customer) =>
      [customer.full_name, customer.email, customer.phone]
        .some((value) => value.toLocaleLowerCase("en-IN").includes(normalized)),
    );
  }, [customers, query]);

  return (
    <section className="provider-dashboard-panel">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="section-kicker">CUSTOMER DIRECTORY</p><h2 className="mt-1 text-xl font-black">Customer accounts</h2></div>
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Search customers</span>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email or phone"
            className="auth-input pl-9"
          />
        </label>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Showing up to the 250 most recently created accounts. Contact details are restricted to administrator access.
      </p>
      {filtered.length ? (
        <div className="mt-4 divide-y divide-border">
          {filtered.map((customer) => (
            <article key={customer.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{customer.full_name}</h3>
                  <span className={`kitchen-status ${customer.is_active ? "status-approved" : "status-suspended"}`}>
                    {customer.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-1 break-all text-sm text-muted-foreground">
                  <a className="underline underline-offset-2" href={`mailto:${customer.email}`}>{customer.email}</a>
                  <span className="mx-2" aria-hidden="true">·</span>
                  <a className="underline underline-offset-2" href={`tel:${customer.phone}`}>{customer.phone}</a>
                </p>
              </div>
              <time className="text-xs text-muted-foreground" dateTime={customer.created_at}>
                Joined {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(customer.created_at))}
              </time>
            </article>
          ))}
        </div>
      ) : (
        <div className="provider-inline-empty mt-4">
          <UsersRound size={18} />
          <p>{query ? "No customers match that search." : "No customer accounts yet."}</p>
        </div>
      )}
    </section>
  );
}
