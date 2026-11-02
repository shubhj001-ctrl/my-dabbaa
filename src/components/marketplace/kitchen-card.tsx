import Link from "next/link";
import { ArrowUpRight, MapPin, Sprout } from "lucide-react";
import { KitchenImage } from "@/components/marketplace/kitchen-image";
import { PriceDisplay } from "@/components/marketplace/price-display";
import { Rating } from "@/components/marketplace/rating";
import type { Kitchen } from "@/types/marketplace";

export function KitchenCard({
  kitchen,
  featured = false,
}: {
  kitchen: Kitchen;
  featured?: boolean;
}) {
  return (
    <article className="kitchen-card group overflow-hidden rounded-[1.25rem] border border-border bg-card">
      <Link
        href={`/kitchens/${kitchen.id}`}
        className="relative block aspect-[1.55] overflow-hidden bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ring"
        aria-label={`View ${kitchen.name}`}
      >
        <KitchenImage
          src={kitchen.image}
          alt={`${kitchen.name} home-cooked meal`}
          className="transition-transform duration-500 group-hover:scale-[1.035]"
        />
        {kitchen.badge ? (
          <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-[11px] font-semibold text-primary shadow-sm backdrop-blur-sm">
            {kitchen.badge}
          </span>
        ) : null}
        {kitchen.isDemo ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-[#24112f] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#c6ff3d]">
            Demo listing
          </span>
        ) : null}
        {kitchen.isVegetarian ? (
          <span
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm"
            title="Vegetarian kitchen"
          >
            <Sprout aria-hidden="true" size={16} />
          </span>
        ) : null}
      </Link>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/kitchens/${kitchen.id}`}
              className="text-lg font-semibold tracking-tight text-foreground underline-offset-4 group-hover:underline"
            >
              {kitchen.name}
            </Link>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin aria-hidden="true" size={14} className="shrink-0" />
              <span>
                {kitchen.sector}, Chandigarh
              </span>
            </p>
          </div>
          <Rating value={kitchen.rating} count={kitchen.reviewCount} compact />
        </div>

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
          {kitchen.tagline}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {kitchen.mealTypes.map((meal) => (
            <span
              key={meal}
              className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
            >
              {meal}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-[11px] text-muted-foreground">{kitchen.startingPrice ? "Plans from" : "Plans"}</p>
            {kitchen.startingPrice ? <PriceDisplay amount={kitchen.startingPrice} suffix={kitchen.isDemo ? "meal" : "plan"} /> : <span className="text-xs font-semibold text-foreground">Coming soon</span>}
          </div>
          <Link
            href={`/kitchens/${kitchen.id}`}
            className="inline-flex min-h-10 items-center gap-1 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-[#173c30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            View kitchen
            <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </div>
        {featured ? (
          <span className="sr-only">Featured kitchen</span>
        ) : null}
      </div>
    </article>
  );
}
