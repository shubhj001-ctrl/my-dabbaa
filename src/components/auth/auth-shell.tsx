import { BrandMark } from "@/components/marketplace/brand-mark";

type AuthShellProps = {
  children: React.ReactNode;
  title: string;
  description: string;
};

export function AuthShell({
  children,
  title,
  description,
}: AuthShellProps) {
  return (
    <main className="auth-page min-h-screen md:grid md:grid-cols-2">
      <section className="flex items-center justify-center px-5 py-10 sm:px-8 md:px-12 lg:px-16">
        <div className="w-full max-w-[440px]">
          <BrandMark href="/explore" />

          <div className="mt-9 sm:mt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              A little closer to home
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-[2.4rem]">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>

          <div className="mt-7 sm:mt-8">{children}</div>
        </div>
      </section>

      <aside className="auth-visual relative hidden min-h-[280px] overflow-hidden md:flex md:min-h-screen md:items-end md:p-10 lg:p-14">
        <div className="relative z-10 max-w-lg text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            Chandigarh, made for sharing
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.03em] lg:text-[2.7rem]">
            The comfort of a home-cooked meal, from a kitchen around the corner.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
            Meet the independent tiffin makers bringing a little more home to
            every day.
          </p>
        </div>
        <span className="absolute right-8 top-8 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
          Local kitchens · familiar flavours
        </span>
      </aside>
    </main>
  );
}
