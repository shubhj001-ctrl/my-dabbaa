import { AdminCustomerDirectory } from "@/components/admin/admin-customer-directory";
import { getAdminCustomers } from "@/services/marketplace/admin-queries";

export default async function AdminCustomersPage() {
  const result = await getAdminCustomers();

  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">CUSTOMER DIRECTORY</p>
        <h1>Keep customer information in good hands.</h1>
        <p>Search customer accounts for support and marketplace operations. Contact information is visible only to trusted administrators.</p>
      </header>
      {result.status === "live" ? (
        <AdminCustomerDirectory customers={result.data} />
      ) : (
        <section className="provider-empty-card">
          <h2>{result.status === "unconfigured" ? "Connect the production database to view customers." : "We couldn’t load customer accounts."}</h2>
          <p>{result.status === "error" ? "Check administrator access and the profiles migration, then refresh." : "Customer data is only displayed from the connected database."}</p>
        </section>
      )}
    </div>
  );
}
