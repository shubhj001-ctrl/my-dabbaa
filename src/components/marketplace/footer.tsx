import Link from "next/link";
import { Camera, Mail, MapPin } from "lucide-react";
import { BrandMark } from "@/components/marketplace/brand-mark";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#f0f1e9]">
      <div className="page-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr] lg:py-16">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            A little more home in every dabbaa. Discover the independent
            kitchens cooking around Chandigarh.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary">
            <MapPin aria-hidden="true" size={14} />
            Chandigarh, India
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Discover</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><Link className="hover:text-primary" href="/explore">Explore kitchens</Link></li>
            <li><Link className="hover:text-primary" href="/#how-it-works">How it works</Link></li>
            <li><Link className="hover:text-primary" href="/#why-dabbaa">Why My Dabbaa</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">For kitchens</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><Link className="hover:text-primary" href="/register?type=provider">Join as a provider</Link></li>
            <li><Link className="hover:text-primary" href="/login">Provider login</Link></li>
            <li><Link className="hover:text-primary" href="/#for-kitchens">Learn more</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Say hello</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Questions or kind words? We’d love to hear from you.
          </p>
          <a
            href="mailto:hello@mydabbaa.example"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Mail aria-hidden="true" size={15} />
            hello@mydabbaa.example
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="My Dabbaa on Instagram"
            className="mt-4 flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Camera aria-hidden="true" size={17} />
          </a>
        </div>
      </div>
      <div className="border-t border-border/80">
        <div className="page-container flex flex-col gap-2 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 My Dabbaa. Made with care in Chandigarh.</p>
          <p>Sample listings and testimonials are illustrative demo content.</p>
        </div>
      </div>
    </footer>
  );
}
