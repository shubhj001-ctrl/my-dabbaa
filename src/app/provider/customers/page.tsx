import { getProviderActivatedCustomers } from "@/services/marketplace/activation-queries";

export default async function ProviderCustomersPage() {
  const result = await getProviderActivatedCustomers();
  if (result.status === "error") {
    return (
      <div className="provider-page space-y-6">
        <header className="provider-page-heading"><p className="section-kicker">YOUR CUSTOMERS</p><h1>Build lasting relationships, one meal at a time.</h1></header>
        <section className="provider-empty-card"><h2>Customer details aren’t available.</h2><p>Check that the Stage 4 activation migration has been applied.</p></section>
      </div>
    );
  }

  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">YOUR CUSTOMERS</p>
        <h1>Build lasting relationships, one meal at a time.</h1>
        <p>Only customers activated for a kitchen you own appear here. Coordinate their food subscription directly; no subscription is automatically created.</p>
      </header>
      {!result.customers.length ? (
        <section className="provider-empty-card"><span className="provider-empty-icon">✳</span><h2>No activated customers yet.</h2><p>After a verified activation payment, authorized customer details will appear here.</p></section>
      ) : (
        <div className="space-y-4">
          {result.customers.map((customer) => (
            <article key={customer.kitchen_customer_id} className="provider-dashboard-panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="section-kicker">{customer.kitchen_name}</p>
                  <h2 className="mt-1 text-xl font-black">{customer.customer_name}</h2>
                </div>
                <time className="text-xs text-muted-foreground">
                  Activated {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(customer.activated_at))}
                </time>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <p className="text-sm"><b>Email:</b> <a className="underline" href={`mailto:${customer.customer_email}`}>{customer.customer_email}</a></p>
                <p className="text-sm"><b>Phone:</b> <a className="underline" href={`tel:${customer.customer_phone}`}>{customer.customer_phone}</a></p>
                <p className="text-sm"><b>Preferred meal:</b> {customer.preferred_meal}</p>
                <p className="text-sm"><b>Preferred start:</b> {customer.preferred_start_date}</p>
              </div>
              {customer.request_message ? <p className="mt-4 rounded-xl bg-muted p-3 text-sm leading-6">{customer.request_message}</p> : null}
              <p className="mt-4 text-xs leading-5 text-muted-foreground">Next step: agree on the food plan, schedule, delivery, and payments directly with the customer.</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
