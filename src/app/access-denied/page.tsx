import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="content-card w-full max-w-lg p-8 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Account access
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          This space isn’t available to this account.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Check that you are using the right account, or contact support if
          you think this is a mistake.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Return to login
        </Link>
      </section>
    </main>
  );
}
