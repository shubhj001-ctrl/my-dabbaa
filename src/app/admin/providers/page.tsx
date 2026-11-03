import { BadgeCheck, Clock3, Mail, MapPin, Phone, Store, UsersRound } from "lucide-react";
import { getProviders } from "@/services/marketplace/admin-queries";

const statusLabel: Record<string, string> = {
  draft: "Draft",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Needs changes",
  suspended: "Suspended",
};

export default async function AdminProvidersPage() {
  const result = await getProviders();

  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">PROVIDER DIRECTORY</p>
        <h1>Help independent providers thrive.</h1>
        <p>Review provider accounts and their kitchens. Kitchen registration and public listings are free.</p>
      </header>

      {result.status === "unconfigured" ? (
        <DirectoryEmpty title="Connect Supabase to view providers." />
      ) : result.status === "error" ? (
        <DirectoryEmpty title="We couldn't load the provider directory." description="Check the provider profile and kitchen migrations, then refresh." />
      ) : result.data.length === 0 ? (
        <DirectoryEmpty title="No provider accounts yet." description="Verified provider accounts will appear here after they register." />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2">
            <article className="provider-metric-card">
              <span className="provider-metric-icon metric-lavender"><UsersRound size={19} /></span>
              <p>Provider accounts</p>
              <strong>{result.data.length}</strong>
              <small>Verified provider profiles</small>
            </article>
            <article className="provider-metric-card">
              <span className="provider-metric-icon metric-lime"><Store size={19} /></span>
              <p>Kitchen listings</p>
              <strong>{result.data.reduce((total, provider) => total + provider.kitchens.length, 0)}</strong>
              <small>Across all provider accounts</small>
            </article>
          </section>

          <section aria-label="Provider accounts" className="space-y-4">
            {result.data.map((provider) => (
              <article className="admin-kitchen-card" key={provider.id}>
                <header className="admin-kitchen-head">
                  <div>
                    <span className={`kitchen-status ${provider.is_active ? "status-approved" : "status-suspended"}`}>
                      {provider.is_active ? "Active account" : "Inactive account"}
                    </span>
                    <h2>{provider.full_name}</h2>
                    <p>Joined {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                      timeZone: "Asia/Kolkata",
                    }).format(new Date(provider.created_at))}</p>
                  </div>
                  <span className="admin-review-mark">
                    <UsersRound size={14} /> PROVIDER
                  </span>
                </header>

                <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                  <div>
                    <h3 className="admin-subhead">Provider contact</h3>
                    <dl className="admin-details-list">
                      <div>
                        <dt><Mail size={13} className="mr-1 inline" />Email</dt>
                        <dd><a href={`mailto:${provider.email}`}>{provider.email}</a></dd>
                      </div>
                      <div>
                        <dt><Phone size={13} className="mr-1 inline" />Phone</dt>
                        <dd><a href={`tel:${provider.phone}`}>{provider.phone}</a></dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="admin-subhead">Kitchen listings ({provider.kitchens.length})</h3>
                    {provider.kitchens.length ? (
                      <ul className="mt-3 space-y-2">
                        {provider.kitchens.map((kitchen) => (
                          <li key={kitchen.id} className="rounded-xl border border-border bg-[#fffdf8] p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold">{kitchen.kitchen_name}</span>
                              <span className={`kitchen-status status-${kitchen.approval_status}`}>
                                {kitchen.approval_status === "approved" && kitchen.is_listed
                                  ? <><BadgeCheck size={12} className="mr-1 inline" />{statusLabel[kitchen.approval_status]}</>
                                  : <><Clock3 size={12} className="mr-1 inline" />{statusLabel[kitchen.approval_status] ?? kitchen.approval_status}</>}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              <MapPin size={12} className="mr-1 inline" />
                              Added {new Intl.DateTimeFormat("en-IN", {
                                dateStyle: "medium",
                                timeZone: "Asia/Kolkata",
                              }).format(new Date(kitchen.created_at))}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">No kitchen listing registered yet.</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function DirectoryEmpty({
  title,
  description = "Provider data is not available in this environment.",
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="provider-empty-card">
      <span className="provider-empty-icon">✳</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
