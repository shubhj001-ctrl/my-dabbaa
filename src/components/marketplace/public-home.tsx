import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Heart,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Footer } from "@/components/marketplace/footer";
import { KitchenCard } from "@/components/marketplace/kitchen-card";
import { KitchenImage } from "@/components/marketplace/kitchen-image";
import { Navbar } from "@/components/marketplace/navbar";
import { SearchBar } from "@/components/marketplace/search-bar";
import { EmptyState } from "@/components/marketplace/empty-state";
import { DabbaStory } from "@/components/marketplace/dabba-story";
import type { Kitchen } from "@/types/marketplace";

type HomeDataAvailability = "live" | "demo" | "unavailable" | "error";

const steps = [
  {
    number: "01",
    title: "Meet your food people.",
    description: "Find the neighbourhood kitchen that gets your cravings.",
    sticker: "THE SCROLL",
    color: "lavender",
  },
  {
    number: "02",
    title: "Get the full menu plot.",
    description: "See what’s cooking, what it costs, and where they deliver.",
    sticker: "THE VIBE CHECK",
    color: "butter",
  },
  {
    number: "03",
    title: "Make it a regular thing.",
    description: "Talk to the kitchen and lock in your new lunch routine.",
    sticker: "THE GOOD PART",
    color: "tomato",
  },
];

const testimonials = [
  {
    name: "Simran K.",
    sector: "Sector 34",
    quote: "Found my lunch soulmate. The rajma is actually unreal.",
    color: "lavender",
  },
  {
    name: "Rohan M.",
    sector: "Sector 22",
    quote: "The first dabba that makes me excited to close my laptop.",
    color: "butter",
  },
  {
    name: "Neha A.",
    sector: "Sector 15",
    quote: "Like having a friend’s mum in your contacts. Best thing ever.",
    color: "lime",
  },
];

export function PublicHome({
  kitchens,
  dataAvailability,
}: {
  kitchens: Kitchen[];
  dataAvailability: HomeDataAvailability;
}) {
  return (
    <>
      <Navbar />
      <main className="brand-home">
        <section className="brand-hero">
          <div className="brand-hero-grid page-container">
            <div className="hero-copy">
              <span className="hero-kicker">
                <span className="live-dot" />
                CHANDIGARH, YOU’RE ON THE MENU
              </span>
              <h1 className="hero-headline">
                <span className="hero-line">GOOD FOOD.</span>
                <span className="hero-line hero-highlight">ZERO BORING</span>
                <span className="hero-line">DAYS<span className="hero-period">.</span></span>
              </h1>
              <p className="hero-support">
                Your neighbourhood&apos;s tastiest homemade food is just around
                the corner.
              </p>
              <div className="hero-actions">
                <Link href="/explore" className="button-pop button-lime">
                  Explore kitchens <ArrowUpRight aria-hidden="true" size={18} />
                </Link>
                <span className="hero-note">
                  <Heart aria-hidden="true" size={14} fill="currentColor" />
                  Cooked by local legends
                </span>
              </div>
              <div className="hero-search-wrap">
                <span className="search-doodle" aria-hidden="true">
                  ✳
                </span>
                <SearchBar />
              </div>
            </div>

            <div className="food-collage" aria-label="A collage of colourful Indian home-cooked food">
              <div className="collage-frame collage-main">
                <KitchenImage
                  src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1100&q=85"
                  alt="A colourful Indian thali packed with home-style food"
                  priority
                />
              </div>
              <div className="collage-frame collage-side">
                <KitchenImage
                  src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=85"
                  alt="A bowl of spicy homemade curry"
                  priority
                />
              </div>
              <div className="collage-frame collage-bottom">
                <KitchenImage
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=85"
                  alt="Freshly prepared colourful salad"
                />
              </div>
              <span className="food-sticker sticker-fresh">FRESH AF <Sparkles aria-hidden="true" size={13} /></span>
              <span className="food-sticker sticker-home">HOMEMADE<br />ALWAYS</span>
              <span className="food-sticker sticker-love" aria-label="Made with love">
                <Heart aria-hidden="true" size={19} fill="currentColor" />
              </span>
              <span className="collage-caption">NOT ANOTHER SAD LUNCH.</span>
              <span className="collage-caption-side">100% NEIGHBOURHOOD ENERGY</span>
            </div>
          </div>
          <div className="hero-bottom-line">
            <span>HOME FOOD HAS ENTERED THE CHAT</span>
            <ArrowDownRight aria-hidden="true" size={18} />
            <span>SCROLL FOR THE GOOD STUFF</span>
          </div>
        </section>

        <section className="ticker-strip" aria-label="My Dabbaa promises">
          <div className="ticker-track">
            {Array.from({ length: 2 }, (_, index) => (
              <span className="ticker-group" key={index}>
                <span>LOCAL KITCHENS</span><i>✳</i><span>BIG HOMEMADE ENERGY</span><i>✳</i>
                <span>CHANDIGARH’S FINEST</span><i>✳</i><span>ZERO SAD DESK LUNCHES</span><i>✳</i>
              </span>
            ))}
          </div>
        </section>

        <section className="page-section featured-section">
          <div className="page-container">
            <div className="section-heading">
              <div>
                <p className="section-kicker">GOOD THINGS IN THE NEIGHBOURHOOD</p>
                <h2 className="section-title">
                  Meet the local <span className="text-highlight">legends.</span>
                </h2>
                <p className="section-description">
                  Small kitchens. Huge main-character lunch energy.
                </p>
              </div>
              <Link href="/explore" className="button-pop button-aubergine section-cta">
                All kitchens <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
            {dataAvailability === "demo" ? <p className="demo-listing-banner">DEMO MODE · SAMPLE KITCHENS, NOT REAL PROVIDERS</p> : null}
            {kitchens.length ? <div className="featured-kitchen-grid mt-8">
              {kitchens.slice(0, 4).map((kitchen) => (
                <KitchenCard key={kitchen.id} kitchen={kitchen} featured />
              ))}
            </div> : (
              <div className="mt-8">
                <EmptyState
                  title={dataAvailability === "error" ? "The kitchens are taking a breather." : "Nothing cooking here yet!"}
                  description={dataAvailability === "error" ? "We couldn't load current listings. Please try again in a moment." : "Be one of the first local legends to list a kitchen in Chandigarh."}
                  action={{ href: "/register?type=provider", label: "List your kitchen for free" }}
                />
              </div>
            )}
            {dataAvailability === "demo" ? <p className="demo-caption">Fictional preview listings. Real kitchens appear after Supabase is configured and approved.</p> : null}
          </div>
        </section>

        <DabbaStory />

        <section id="how-it-works" className="how-section">
          <div className="page-container">
            <div className="how-heading">
              <span className="section-kicker">THREE STEPS. ZERO DRAMA.</span>
              <h2 className="how-title">
                YOUR NEW LUNCH
                <br />
                <span>LORE STARTS HERE.</span>
              </h2>
              <p>Less scrolling delivery apps. More knowing who made your food.</p>
            </div>
            <div className="how-grid">
              {steps.map((step) => (
                <article className={`how-card how-${step.color}`} key={step.number}>
                  <span className="how-number">{step.number}</span>
                  <span className="how-sticker">{step.sticker}</span>
                  <div className="how-doodle" aria-hidden="true">
                    {step.number === "01" ? "⌕" : step.number === "02" ? "✳" : "♡"}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="why-dabbaa" className="why-section">
          <div className="page-container why-grid">
            <div className="why-copy">
              <span className="section-kicker">A DIFFERENT KIND OF FOOD APP</span>
              <h2 className="section-title">
                THE FOOD IS LOCAL.
                <br />
                <span className="text-highlight">THE LOVE IS EXTRA.</span>
              </h2>
              <p className="section-description">
                No endless menus or mystery meals. Just independent kitchens
                around your corner, doing what they do best.
              </p>
              <div className="why-pills">
                <span>Made nearby</span><span>Know the menu</span><span>Talk to the cook</span>
              </div>
              <Link href="/explore" className="button-pop button-tomato mt-7">
                Find your food people <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
            <div className="why-visual">
              <div className="why-photo">
                <KitchenImage
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85"
                  alt="A generous meal made to share"
                />
              </div>
              <span className="why-burst">GOOD<br />FOOD<br />CLUB</span>
              <span className="why-note">your mum<br />would approve ✓</span>
            </div>
          </div>
        </section>

        <section id="for-kitchens" className="provider-section">
          <div className="page-container provider-inner">
            <div className="provider-sticker" aria-hidden="true">
              <Utensils size={23} />
              <span>YOUR KITCHEN<br />YOUR RULES</span>
            </div>
            <div className="provider-copy">
              <span className="section-kicker">HEY, HOME COOKS 👀</span>
              <h2>
                YOUR FOOD
                <br />
                DESERVES A
                <br />
                <span>BIGGER TABLE.</span>
              </h2>
              <p>Put your kitchen on the map. Find your people. Listing is free.</p>
            </div>
            <Link href="/register?type=provider" className="button-pop button-aubergine provider-button">
              Let&apos;s get cooking <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </section>

        <section className="page-section people-section">
          <div className="page-container">
            <div className="people-heading">
              <span className="section-kicker">THE GROUP CHAT HAS SPOKEN</span>
              <h2 className="section-title">Lunch is the <span className="text-highlight">love language.</span></h2>
              <p className="section-description">Fictional sample quotes. Real feelings about good food.</p>
            </div>
            <div className="people-grid">
              {testimonials.map((item, index) => (
                <figure className={`people-card people-${item.color}`} key={item.name}>
                  <span className="people-stars" aria-label="5 out of 5 stars">★★★★★</span>
                  <blockquote>“{item.quote}”</blockquote>
                  <figcaption>
                    <span className="people-avatar">{item.name.charAt(0)}</span>
                    <span><b>{item.name}</b><small>{item.sector} · fictional</small></span>
                    <span className="people-emoji" aria-hidden="true">{index === 0 ? "💚" : index === 1 ? "🤌" : "✨"}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
