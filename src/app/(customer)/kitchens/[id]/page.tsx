import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KitchenDetailsExperience } from "@/components/marketplace/kitchen-details-experience";
import { kitchens } from "@/data/mock-data/kitchens";
import { getPublicKitchenBySlug } from "@/services/marketplace/queries";

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
  const result = await getPublicKitchenBySlug(id);
  const demo = result.status === "unconfigured" && process.env.NODE_ENV === "development"
    ? kitchens.find((entry) => entry.id === id)
    : null;
  const kitchen = result.status === "live"
    ? result.data
    : demo ? { ...demo, isDemo: true } : null;

  if (!kitchen) notFound();

  if (result.status === "error") {
    return (
      <div className="provider-page page-container py-16">
        <h1 className="text-3xl font-black">Kitchen profile isn&apos;t loading.</h1>
        <p className="mt-3 text-muted-foreground">Please try again in a moment.</p>
      </div>
    );
  }
  return <KitchenDetailsExperience kitchen={kitchen} />;
}

export async function generateMetadata({
  params,
}: PageProps<"/kitchens/[id]">): Promise<Metadata> {
  const { id } = await params;
  const result = await getPublicKitchenBySlug(id);
  const demo = result.status === "unconfigured" && process.env.NODE_ENV === "development"
    ? kitchens.find((entry) => entry.id === id)
    : null;
  const kitchen = result.status === "live"
    ? result.data
    : demo ? { ...demo, isDemo: true } : null;
  return {
    title: kitchen?.name ?? "Kitchen not found",
    description: kitchen?.tagline,
  };
}
