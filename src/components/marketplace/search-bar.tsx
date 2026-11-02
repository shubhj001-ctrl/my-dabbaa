import { MapPin, Search } from "lucide-react";

type SearchBarProps = {
  compact?: boolean;
  initialQuery?: string;
  initialSector?: string;
};

export function SearchBar({
  compact = false,
  initialQuery = "",
  initialSector = "all",
}: SearchBarProps) {
  return (
    <form
      action="/explore"
      role="search"
      className={`search-bar grid gap-2 rounded-2xl border border-border bg-card p-2 shadow-[0_12px_36px_rgb(31_54_42/10%)] sm:grid-cols-[minmax(0,1.3fr)_minmax(150px,0.8fr)_auto] sm:items-center ${
        compact ? "max-w-3xl" : ""
      }`}
    >
      <label className="flex min-h-12 items-center gap-3 px-3">
        <Search aria-hidden="true" size={18} className="shrink-0 text-primary" />
        <span className="sr-only">Search kitchen or meal</span>
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder="Kitchen name or a meal you love"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <label className="flex min-h-12 items-center gap-3 border-t border-border px-3 sm:border-l sm:border-t-0">
        <MapPin aria-hidden="true" size={17} className="shrink-0 text-primary" />
        <span className="sr-only">Chandigarh sector</span>
        <select
          name="sector"
          defaultValue={initialSector}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
        >
          <option value="all">All Chandigarh</option>
          <option value="Sector 8">Sector 8</option>
          <option value="Sector 15">Sector 15</option>
          <option value="Sector 17">Sector 17</option>
          <option value="Sector 22">Sector 22</option>
          <option value="Sector 34">Sector 34</option>
          <option value="Sector 35">Sector 35</option>
          <option value="Sector 44">Sector 44</option>
          <option value="Sector 46">Sector 46</option>
        </select>
      </label>

      <button
        type="submit"
        className="min-h-12 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#173c30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Find my dabbaa
      </button>
    </form>
  );
}
