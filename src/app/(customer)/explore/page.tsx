import { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreExperience } from "@/components/marketplace/explore-experience";
import { getPublicKitchens } from "@/services/marketplace/queries";
import { kitchens as demoKitchens } from "@/data/mock-data/kitchens";

export const metadata: Metadata = {
  title: "Explore local kitchens",
};

export default function ExplorePage({
  searchParams,
}: PageProps<"/explore">) {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
      <ExplorePageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ExplorePageContent({
  searchParams,
}: Pick<PageProps<"/explore">, "searchParams">) {
  const { q, sector } = await searchParams;
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
  return (
    <ExploreExperience
      initialQuery={typeof q === "string" ? q : ""}
      initialSector={typeof sector === "string" ? sector : "all"}
      kitchens={listings}
      dataAvailability={dataAvailability}
    />
  );
}
