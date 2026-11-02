import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KitchenDetailsExperience } from "@/components/marketplace/kitchen-details-experience";
import { kitchens } from "@/data/mock-data/kitchens";

export default function KitchenPage({
  params,
}: PageProps<"/kitchens/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
      <KitchenPageContent params={params} />
    </Suspense>
  );
}

async function KitchenPageContent({
  params,
}: Pick<PageProps<"/kitchens/[id]">, "params">) {
  const { id } = await params;
  const kitchen = kitchens.find((entry) => entry.id === id);

  if (!kitchen) notFound();

  return <KitchenDetailsExperience kitchen={kitchen} />;
}

export async function generateMetadata({
  params,
}: PageProps<"/kitchens/[id]">): Promise<Metadata> {
  const { id } = await params;
  const kitchen = kitchens.find((entry) => entry.id === id);
  return {
    title: kitchen?.name ?? "Kitchen not found",
    description: kitchen?.tagline,
  };
}
