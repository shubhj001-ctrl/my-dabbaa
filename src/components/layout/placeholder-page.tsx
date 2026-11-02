import Link from "next/link";
import { ArrowRight, Check, Clock3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/types/navigation";

type PlaceholderPageProps = {
  role: AppRole;
  eyebrow: string;
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  };
  featured?: boolean;
};

const roleCopy: Record<AppRole, string> = {
  customer: "A welcoming place to find everyday meals made nearby.",
  provider: "A calm workspace for independent kitchens to grow.",
  admin: "A considered foundation for keeping the marketplace healthy.",
};

export function PlaceholderPage({
  role,
  eyebrow,
  title,
  description,
  action,
  featured = false,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-7">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[2.6rem]">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          {description}
        </p>
        {action ? (
          <div className="pt-2">
            <Button
              render={<Link href={action.href} />}
              size="lg"
              className="rounded-full px-5"
            >
              {action.label}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        ) : null}
      </div>

      <section
        className={`content-card overflow-hidden p-6 sm:p-8 ${
          featured
            ? "home-hero-photo min-h-[270px] border-0 text-white sm:min-h-[320px] sm:p-10"
            : ""
        }`}
        aria-label="Section introduction"
      >
        <div className="flex h-full max-w-xl flex-col justify-center">
          <span
            className={`mb-5 flex size-11 items-center justify-center rounded-2xl ${
              featured ? "bg-white/15 text-white" : "bg-accent text-primary"
            }`}
          >
            <Sparkles aria-hidden="true" size={20} />
          </span>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.14em] ${
              featured ? "text-white/75" : "text-primary"
            }`}
          >
            {roleCopy[role]}
          </p>
          <h2
            className={`mt-3 text-xl font-semibold tracking-tight sm:text-2xl ${
              featured ? "text-white" : "text-foreground"
            }`}
          >
            Thoughtfully built for real neighbourhoods.
          </h2>
          <p
            className={`mt-3 max-w-lg text-sm leading-6 ${
              featured ? "text-white/80" : "text-muted-foreground"
            }`}
          >
            The product foundation is ready. This screen is a placeholder for
            the next stage, with customer privacy and independent kitchens at
            its heart.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="content-card p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Check aria-hidden="true" size={17} className="text-primary" />
            Foundation in place
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This route has its own role-aware layout and is ready for its
            product experience to be designed.
          </p>
        </section>
        <section className="content-card p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock3 aria-hidden="true" size={17} className="text-primary" />
            Next build stage
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Real data and marketplace workflows will be added after the
            foundation is reviewed.
          </p>
        </section>
      </div>
    </div>
  );
}
