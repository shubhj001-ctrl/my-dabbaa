import type { Metadata } from "next";
import { PublicHome } from "@/components/marketplace/public-home";

export const metadata: Metadata = {
  title: "Good food. Zero boring days.",
  description:
    "Discover your neighbourhood's tastiest homemade food and local kitchens in Chandigarh.",
};

export default function IndexPage() {
  return <PublicHome />;
}
