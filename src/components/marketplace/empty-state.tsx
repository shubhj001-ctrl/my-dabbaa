import Link from "next/link";
import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-primary">
        <SearchX aria-hidden="true" size={21} />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? (
        <Link
          href={action.href}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-[#173c30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {action.label}
        </Link>
      ) : null}
    </section>
  );
}
