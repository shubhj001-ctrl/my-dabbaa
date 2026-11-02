"use client";

import { SlidersHorizontal, X } from "lucide-react";
import type { MealType } from "@/types/marketplace";

export type KitchenFilters = {
  sector: string;
  mealType: string;
  vegetarian: boolean;
  maxPrice: number;
  minRating: number;
  sort: "popular" | "rating" | "price-low" | "price-high";
};

export const initialKitchenFilters: KitchenFilters = {
  sector: "all",
  mealType: "all",
  vegetarian: false,
  maxPrice: 300,
  minRating: 0,
  sort: "popular",
};

const mealTypes: MealType[] = [
  "North Indian",
  "Punjabi",
  "Gujarati",
  "South Indian",
];

type FilterSidebarProps = {
  filters: KitchenFilters;
  onChange: (filters: KitchenFilters) => void;
  onClose?: () => void;
};

export function FilterSidebar({
  filters,
  onChange,
  onClose,
}: FilterSidebarProps) {
  function update<K extends keyof KitchenFilters>(
    key: K,
    value: KitchenFilters[K],
  ) {
    onChange({ ...filters, [key]: value });
  }

  const fields = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <SlidersHorizontal aria-hidden="true" size={17} />
          Refine your search
        </div>
        <button
          type="button"
          onClick={() => onChange(initialKitchenFilters)}
          className="text-xs font-medium text-primary hover:underline"
        >
          Clear all
        </button>
      </div>

      <fieldset className="filter-fieldset">
        <legend>Neighbourhood</legend>
        <select
          value={filters.sector}
          onChange={(event) => update("sector", event.target.value)}
          className="filter-select"
          aria-label="Filter by Chandigarh sector"
        >
          <option value="all">All Chandigarh</option>
          {[8, 15, 17, 22, 34, 35, 44, 46].map((sector) => (
            <option key={sector} value={`Sector ${sector}`}>
              Sector {sector}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="filter-fieldset">
        <legend>Meal style</legend>
        <div className="space-y-2.5">
          <label className="filter-check">
            <input
              type="radio"
              name="meal-type-desktop"
              checked={filters.mealType === "all"}
              onChange={() => update("mealType", "all")}
            />
            <span>All meal styles</span>
          </label>
          {mealTypes.map((meal) => (
            <label key={meal} className="filter-check">
              <input
                type="radio"
                name="meal-type-desktop"
                checked={filters.mealType === meal}
                onChange={() => update("mealType", meal)}
              />
              <span>{meal}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="filter-check rounded-xl bg-[var(--surface-soft)] p-3">
        <input
          type="checkbox"
          checked={filters.vegetarian}
          onChange={(event) => update("vegetarian", event.target.checked)}
        />
        <span>Vegetarian kitchens</span>
      </label>

      <fieldset className="filter-fieldset">
        <legend>
          Price per meal{" "}
          <span className="font-normal text-muted-foreground">
            · up to ₹{filters.maxPrice}
          </span>
        </legend>
        <input
          aria-label="Maximum price per meal"
          type="range"
          min={100}
          max={300}
          step={10}
          value={filters.maxPrice}
          onChange={(event) => update("maxPrice", Number(event.target.value))}
          className="w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>₹100</span>
          <span>₹300+</span>
        </div>
      </fieldset>

      <fieldset className="filter-fieldset">
        <legend>Minimum rating</legend>
        <select
          value={filters.minRating}
          onChange={(event) => update("minRating", Number(event.target.value))}
          className="filter-select"
          aria-label="Minimum kitchen rating"
        >
          <option value={0}>Any rating</option>
          <option value={4}>4.0 and above</option>
          <option value={4.5}>4.5 and above</option>
          <option value={4.8}>4.8 and above</option>
        </select>
      </fieldset>

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground lg:hidden"
        >
          Show kitchens
        </button>
      ) : null}
    </>
  );

  return (
    <>
      <aside className="hidden rounded-2xl border border-border bg-card p-5 lg:block">
        <div className="space-y-6">{fields}</div>
      </aside>
      <details className="group rounded-2xl border border-border bg-card lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-medium text-foreground [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <SlidersHorizontal aria-hidden="true" size={17} />
            Filters and preferences
          </span>
          {onClose ? (
            <X
              aria-hidden="true"
              size={17}
              className="hidden group-open:block"
            />
          ) : null}
        </summary>
        <div className="space-y-6 border-t border-border p-4">{fields}</div>
      </details>
    </>
  );
}
