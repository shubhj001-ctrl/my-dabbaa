import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicHome } from "@/components/marketplace/public-home";
import { getPublicKitchens } from "@/services/marketplace/queries";
import { kitchens as demoKitchens } from "@/data/mock-data/kitchens";

export const metadata: Metadata = {
  title: "Good food. Zero boring days.",
  description:
    "Discover your neighbourhood's tastiest homemade food and local kitchens in Chandigarh.",
};

export default function IndexPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
      <HomePageContent />
    </Suspense>
  );
}

async function HomePageContent() {
  const result = await getPublicKitchens();
  const dataAvailability =
    result.status === "live"
      ? "live"
      : result.status === "error"
        ? "error"
        : process.env.NODE_ENV === "development"
          ? "demo"
          : "unavailable";
  const listings =
    dataAvailability === "live"
      ? result.status === "live" ? result.data : []
      : dataAvailability === "demo" ? demoKitchens.map((kitchen) => ({ ...kitchen, isDemo: true })) : [];

  return <PublicHome kitchens={listings} dataAvailability={dataAvailability} />;
}
