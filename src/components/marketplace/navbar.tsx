"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/marketplace/brand-mark";

const links = [
  { label: "Explore", href: "/explore" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "For kitchens", href: "/#for-kitchens" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="market-navbar sticky top-0 z-40">
      <nav
        aria-label="Main navigation"
        className="page-container flex min-h-[76px] items-center justify-between gap-5"
      >
        <span onClick={() => setOpen(false)} className="contents">
          <BrandMark />
        </span>

        <div className="hidden items-center gap-4 sm:flex lg:gap-8">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link text-xs font-bold text-muted-foreground transition-colors lg:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="nav-login rounded-full px-4 py-2.5 text-sm font-bold text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="nav-cta rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="mobile-menu-button flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>

      {open ? (
        <div
          id="mobile-navigation"
          className="mobile-navigation border-t border-border bg-background px-5 pb-5 pt-3 sm:hidden"
        >
          <div className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border px-4 py-3 text-center text-sm font-semibold text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
