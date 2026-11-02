"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpDown, Search, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/marketplace/empty-state";
import {
  FilterSidebar,
  initialKitchenFilters,
  type KitchenFilters,
} from "@/components/marketplace/filter-sidebar";
import { KitchenCard } from "@/components/marketplace/kitchen-card";
import { Navbar } from "@/components/marketplace/navbar";
import { Footer } from "@/components/marketplace/footer";
import type { Kitchen } from "@/types/marketplace";

export function ExploreExperience({
  initialQuery = "",
  initialSector = "all",
  kitchens: listingData,
  dataAvailability,
}: {
  initialQuery?: string;
  initialSector?: string;
  kitchens: Kitchen[];
  dataAvailability: "live" | "demo" | "unavailable" | "error";
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<KitchenFilters>({
    ...initialKitchenFilters,
    sector: initialSector,
  });

  const visibleKitchens = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const results = listingData.filter((kitchen) => {
      const matchesQuery =
        !normalizedQuery ||
        `${kitchen.name} ${kitchen.tagline} ${kitchen.location} ${kitchen.mealTypes.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesSector =
        filters.sector === "all" ||
        kitchen.sector === filters.sector ||
        kitchen.serviceAreas.includes(filters.sector);
      const matchesMeal =
        filters.mealType === "all" ||
        kitchen.mealCategories?.some(
          (meal) => meal.toLowerCase() === filters.mealType,
        ) ||
        kitchen.menu.some((meal) => meal.category.toLowerCase() === filters.mealType);
      const matchesVegetarian =
        (!filters.vegetarian || kitchen.foodType === "vegetarian" || (!kitchen.foodType && kitchen.isVegetarian)) &&
        (!filters.nonVegetarian || kitchen.foodType === "non_vegetarian" || kitchen.foodType === "both" || (!kitchen.foodType && !kitchen.isVegetarian));
      const matchesPrice = kitchen.startingPrice <= filters.maxPrice;
      const matchesRating = kitchen.reviewCount === 0 || kitchen.rating >= filters.minRating;

      return (
        matchesQuery &&
        matchesSector &&
        matchesMeal &&
        matchesVegetarian &&
        matchesPrice &&
        matchesRating
      );
    });

    return results.sort((first, second) => {
      if (filters.sort === "rating") return second.rating - first.rating;
      if (filters.sort === "price-low") return first.startingPrice - second.startingPrice;
      if (filters.sort === "price-high") return second.startingPrice - first.startingPrice;
      return second.reviewCount - first.reviewCount;
    });
  }, [filters, listingData, query]);

  return (
    <>
      <Navbar />
      <main className="explore-page page-container min-h-[70vh] py-8 sm:py-12">
        <div className="explore-heading max-w-3xl">
          <p className="section-kicker"><Sparkles aria-hidden="true" size={14} /> YOUR CITY, YOUR MENU</p>
          <h1 className="mt-2 font-serif text-4xl font-medium tracking-[-0.04em] text-foreground sm:text-5xl">
            Find your food people<span>.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Get to know independent tiffin makers around Chandigarh, from
            familiar Punjabi comfort food to a fresh, seasonal dabba.
          </p>
        </div>

        <label className="explore-search search-bar mt-7 flex min-h-14 max-w-3xl items-center gap-3 rounded-2xl border border-border bg-card px-4 shadow-[0_8px_24px_rgb(31_54_42/5%)] focus-within:border-ring">
          <Search aria-hidden="true" size={18} className="text-primary" />
          <span className="sr-only">Search by kitchen, meal or sector</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “Punjabi”, “Sector 34” or a kitchen name"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="explore-chips" aria-label="Quick kitchen filters">
          {[
            ["Any meal", "all"],
            ["Breakfast", "breakfast"],
            ["Lunch", "lunch"],
            ["Dinner", "dinner"],
          ].map(([label, meal]) => (
            <button
              key={meal}
              type="button"
              aria-pressed={filters.mealType === meal}
              onClick={() => setFilters({ ...filters, mealType: meal })}
              className="explore-chip"
            >
              {label}
            </button>
          ))}
          <button type="button" aria-pressed={filters.vegetarian && !filters.nonVegetarian} onClick={() => setFilters({ ...filters, vegetarian: !filters.vegetarian, nonVegetarian: false })} className="explore-chip explore-chip-veg">Veg-only</button>
          <button type="button" aria-pressed={filters.nonVegetarian} onClick={() => setFilters({ ...filters, nonVegetarian: !filters.nonVegetarian, vegetarian: false })} className="explore-chip explore-chip-nonveg">Non-veg</button>
        </div>

        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
          <FilterSidebar filters={filters} onChange={setFilters} />
          <section aria-labelledby="results-heading">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="results-heading"
                  className="text-lg font-semibold text-foreground"
                >
                  {visibleKitchens.length} kitchens to get to know
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dataAvailability === "demo" ? "Fictional demo listings for Chandigarh." : "Approved and listed Chandigarh kitchens."}
                </p>
              </div>
              <label className="flex min-h-10 items-center gap-2 self-start rounded-xl border border-border bg-card px-3 text-xs text-muted-foreground sm:self-auto">
                <ArrowUpDown aria-hidden="true" size={15} />
                <span>Sort by</span>
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      sort: event.target.value as KitchenFilters["sort"],
                    })
                  }
                  className="max-w-[155px] bg-transparent py-2 font-medium text-foreground outline-none"
                  aria-label="Sort kitchens"
                >
                  <option value="popular">Most popular</option>
                  <option value="rating">Highest rated</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                </select>
              </label>
            </div>
            {visibleKitchens.length ? (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {visibleKitchens.map((kitchen) => (
                  <KitchenCard key={kitchen.id} kitchen={kitchen} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={dataAvailability === "error" ? "Listings aren't loading right now." : dataAvailability === "unavailable" ? "Kitchen listings aren't connected yet." : dataAvailability === "demo" ? "No demo kitchens match that vibe." : "Nothing cooking here yet!"}
                description={dataAvailability === "error" ? "Please try again in a moment." : dataAvailability === "unavailable" ? "Connect the Supabase project and approved listings will appear here." : "Try a different search or widen your filters to meet more neighbourhood kitchens."}
                action={dataAvailability === "live" || dataAvailability === "demo" ? undefined : { href: "/register?type=provider", label: "List your kitchen for free" }}
              />
            )}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Looking for a particular kitchen?{" "}
              <Link href="/#for-kitchens" className="font-semibold text-primary hover:underline">
                Invite them to My Dabbaa
              </Link>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
