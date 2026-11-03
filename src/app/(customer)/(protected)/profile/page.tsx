import { CustomerProfileForm } from "@/components/marketplace/customer-profile-form";
import { requireRole } from "@/lib/auth";

export default async function ProfilePage() {
  const profile = await requireRole("customer");

  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">YOUR PROFILE</p>
        <h1>Your details, shared on your terms.</h1>
        <p>Keep your account details up to date. You decide when a kitchen may receive your contact information.</p>
      </header>
      <CustomerProfileForm fullName={profile.full_name} email={profile.email} phone={profile.phone} />
    </div>
  );
}
