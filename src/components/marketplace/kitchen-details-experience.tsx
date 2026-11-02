"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  Sprout,
} from "lucide-react";
import { Footer } from "@/components/marketplace/footer";
import { KitchenImage } from "@/components/marketplace/kitchen-image";
import { Navbar } from "@/components/marketplace/navbar";
import { PriceDisplay } from "@/components/marketplace/price-display";
import { Rating } from "@/components/marketplace/rating";
import { SubscriptionPlanCard } from "@/components/marketplace/subscription-plan-card";
import type { Kitchen, SubscriptionPlan } from "@/types/marketplace";

export function KitchenDetailsExperience({ kitchen }: { kitchen: Kitchen }) {
  const [selectedMenu, setSelectedMenu] = useState<"Lunch" | "Dinner" | "Breakfast">(
    kitchen.menu[0]?.category ?? "Lunch",
  );
  const [notice, setNotice] = useState("");

  function choosePlan(plan: SubscriptionPlan) {
    setNotice(
      kitchen.isDemo
        ? `${plan.name} selected in demo. Contact ${kitchen.name} directly to arrange a subscription.`
        : `${plan.name} is informational only. Contact ${kitchen.name} directly to arrange meals and payment.`,
    );
  }

  return (
    <>
      <Navbar />
      <main className="kitchen-profile page-container pb-14 pt-5 sm:pb-20 sm:pt-8">
        <Link
          href="/explore"
          className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          All kitchens
        </Link>
        {kitchen.isDemo ? <p className="demo-listing-banner mt-3">DEMO PROFILE · THIS IS A FICTIONAL SAMPLE KITCHEN</p> : null}

        <section
          aria-label={`${kitchen.name} food gallery`}
          className="profile-gallery mt-4 grid h-[300px] gap-3 overflow-hidden rounded-[1.5rem] sm:h-[390px] sm:grid-cols-[1.5fr_1fr_1fr]"
        >
          <div className="relative col-span-2 row-span-2 min-h-[220px] overflow-hidden rounded-2xl bg-[var(--surface-soft)] sm:col-span-1">
            <KitchenImage
              src={kitchen.gallery[0] ?? kitchen.image}
              alt={`${kitchen.name} featured meal`}
              priority
            />
          </div>
          {kitchen.gallery.slice(1, 3).map((image, index) => (
            <div
              key={image}
              className="relative hidden min-h-[180px] overflow-hidden rounded-2xl bg-[var(--surface-soft)] sm:block"
            >
              <KitchenImage
                src={image}
                alt={`${kitchen.name} meal ${index + 2}`}
              />
            </div>
          ))}
        </section>

        <div className="mt-7 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {kitchen.mealTypes.map((meal) => (
                <span key={meal} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {meal}
                </span>
              ))}
              {kitchen.isVegetarian ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#edf4e9] px-3 py-1 text-xs font-medium text-primary">
                  <Sprout aria-hidden="true" size={13} />
                  Vegetarian
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.04em] text-foreground sm:text-5xl">
              {kitchen.name}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {kitchen.tagline}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Rating value={kitchen.rating} count={kitchen.reviewCount} />
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin aria-hidden="true" size={15} />
                {kitchen.location}
              </span>
            </div>

            <div className="mt-7 border-t border-border pt-7">
              <h2 className="text-xl font-semibold text-foreground">
                A little about this kitchen
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                {kitchen.description}
              </p>
              <div className="mt-5">
                <p className="text-sm font-semibold text-foreground">
                  Neighbourhoods served
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {kitchen.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <section className="mt-9 border-t border-border pt-7" aria-labelledby="menu-heading">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="section-kicker">Fresh from the kitchen</p>
                  <h2 id="menu-heading" className="mt-1 text-2xl font-semibold text-foreground">
                    A taste of the menu
                  </h2>
                </div>
                <div className="flex rounded-full bg-[#eeefe8] p-1" role="group" aria-label="Select menu">
                  {(["Breakfast", "Lunch", "Dinner"] as const).filter((category) => kitchen.menu.some((item) => item.category === category)).map((category) => (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={selectedMenu === category}
                      onClick={() => setSelectedMenu(category)}
                      className={`min-h-9 rounded-full px-4 text-xs font-semibold transition-colors ${
                        selectedMenu === category
                          ? "bg-card text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div className="menu-sheet mt-4 divide-y divide-border px-5">
                {kitchen.menu
                  .filter((item) => item.category === selectedMenu)
                  .map((item) => (
                    <article key={item.id} className="flex gap-3 py-4">
                      <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded border border-primary/40 text-primary" aria-label="Vegetarian">
                        <span className="size-2 rounded-full bg-primary" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm leading-5 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      {item.imageUrl ? (
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border">
                          <KitchenImage src={item.imageUrl} alt={`${item.name} menu`} />
                        </div>
                      ) : null}
                    </article>
                  ))}
                {!kitchen.menu.some((item) => item.category === selectedMenu) ? (
                  <p className="py-6 text-sm text-muted-foreground">Nothing posted for this meal yet. Check back soon.</p>
                ) : null}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 aria-hidden="true" size={13} />
                {kitchen.isDemo ? "Sample menu; the real menu may vary by day." : "Menu may vary by day. Contact the kitchen to confirm availability."}
              </p>
            </section>

            <section className="mt-9 border-t border-border pt-7" aria-labelledby="reviews-heading">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="section-kicker">Kind words</p>
                  <h2 id="reviews-heading" className="mt-1 text-2xl font-semibold text-foreground">
                    What neighbours say
                  </h2>
                </div>
                <Rating value={kitchen.rating} count={kitchen.reviewCount} />
              </div>
              {kitchen.isDemo ? <p className="mt-2 text-xs text-muted-foreground">Fictional sample reviews for preview only.</p> : null}
              {kitchen.reviews.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {kitchen.reviews.map((review) => (
                  <figure key={review.id} className="review-card rounded-2xl border border-border bg-card p-5">
                    <Rating value={review.rating} />
                    <blockquote className="mt-3 text-sm leading-6 text-foreground">
                      “{review.text}”
                    </blockquote>
                    <figcaption className="mt-4 flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary">
                        {review.initials}
                      </span>
                      <span>
                        <span className="block text-xs font-semibold text-foreground">
                          {review.name} · fictional
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {review.date}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div> : <p className="mt-4 rounded-xl bg-[#f0eaff] px-4 py-4 text-sm">No ratings yet. Your first meal could be the first review.</p>}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="choose-card rounded-2xl border border-border bg-card p-5 shadow-[0_12px_36px_rgb(31_54_42/6%)]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                Meals from
              </p>
              <div className="mt-1">
                <PriceDisplay
                  amount={kitchen.startingPrice}
                  suffix="meal"
                  className="text-2xl"
                />
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Explore the menu and choose a meal routine that suits you.
              </p>
              {kitchen.isDemo || !kitchen.contactPhone ? (
                <button
                  type="button"
                  onClick={() => setNotice(`Demo only: get in touch with ${kitchen.name} directly to discuss a meal plan.`)}
                  className="choose-primary mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#173c30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Choose this kitchen <ArrowRight aria-hidden="true" size={16} />
                </button>
              ) : (
                <a href={`tel:${kitchen.contactPhone.replace(/[^\d+]/g, "")}`} className="choose-primary mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
                  Call to choose this kitchen <ArrowRight aria-hidden="true" size={16} />
                </a>
              )}
              {kitchen.contactPhone ? (
                <a href={`tel:${kitchen.contactPhone.replace(/[^\d+]/g, "")}`} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-secondary">
                  <MessageCircle aria-hidden="true" size={16} /> Contact provider
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setNotice("Contact is a preview interaction. Provider contact details will be available on a real listing.")}
                  className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-secondary"
                >
                  <MessageCircle aria-hidden="true" size={16} /> Contact provider
                </button>
              )}
              {kitchen.contactEmail ? <a href={`mailto:${kitchen.contactEmail}`} className="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-full text-sm font-bold text-foreground hover:bg-secondary">Email the kitchen</a> : null}
              {notice ? (
                <p className="mt-3 rounded-xl bg-accent px-3 py-2.5 text-xs leading-5 text-primary" role="status" aria-live="polite">
                  {notice}
                </p>
              ) : null}
              <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">
                {kitchen.isDemo ? "Sample profile. No request or payment is submitted." : "Plans are informational only. Arrange meals and payment directly with the kitchen."}
              </p>
            </section>
          </aside>
        </div>

        <section className="mt-12 border-t border-border pt-8" aria-labelledby="plans-heading">
          <p className="section-kicker">A little more routine</p>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 id="plans-heading" className="mt-1 text-2xl font-semibold text-foreground">
                Sample meal plans
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Illustrative prices only. Subscription arrangements and food
                payments are made directly with the kitchen.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Check aria-hidden="true" size={15} className="text-primary" />
              No platform food payment
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {kitchen.plans.map((plan) => (
              <SubscriptionPlanCard
                key={plan.id}
                plan={plan}
                onChoose={choosePlan}
              />
            ))}
          </div>
          {notice ? (
            <p className="mt-4 text-sm text-primary" role="status">
              {notice}
            </p>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
