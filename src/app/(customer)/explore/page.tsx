import { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreExperience } from "@/components/marketplace/explore-experience";

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
  return (
    <ExploreExperience
      initialQuery={typeof q === "string" ? q : ""}
      initialSector={typeof sector === "string" ? sector : "all"}
    />
  );
}
