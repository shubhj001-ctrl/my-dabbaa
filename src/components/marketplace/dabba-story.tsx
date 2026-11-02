import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function DabbaStory() {
  return (
    <section className="dabba-story" aria-labelledby="dabba-story-heading">
      <div className="dabba-story-stage">
        <div className="dabba-story-inner page-container">
          <div className="dabba-art" role="img" aria-label="An illustrated colourful tiffin box opening to reveal roti, sabzi, rice and dal">
            <span className="dabba-sunburst" aria-hidden="true">✳</span>
            <span className="dabba-sticker dabba-sticker-fresh" aria-hidden="true">MADE WITH<br />MAIN CHARACTER ENERGY</span>
            <span className="dabba-sticker dabba-sticker-local" aria-hidden="true">LOCAL<br />LEGENDS</span>
            <div className="dabba-lid" aria-hidden="true">
              <span className="dabba-lid-handle" />
              <span className="dabba-lid-mark">MY DABBAA ✳</span>
            </div>
            <div className="dabba-tray" aria-hidden="true">
              <div className="dabba-compartment dabba-compartment-roti"><span>🫓</span><small>ROTI</small></div>
              <div className="dabba-compartment dabba-compartment-sabzi"><span>🍛</span><small>SABZI</small></div>
              <div className="dabba-compartment dabba-compartment-rice"><span>🍚</span><small>RICE</small></div>
              <div className="dabba-compartment dabba-compartment-dal"><span>🥣</span><small>DAL</small></div>
            </div>
            <span className="dabba-sparkle dabba-sparkle-one" aria-hidden="true">✦</span>
            <span className="dabba-sparkle dabba-sparkle-two" aria-hidden="true">✧</span>
            <span className="dabba-orbit" aria-hidden="true" />
          </div>
          <div className="dabba-story-copy">
            <span className="section-kicker">A LITTLE STORY IN EVERY DABBA</span>
            <h2 id="dabba-story-heading">
              Your next food obsession is <span>closer than you think.</span>
            </h2>
            <p>
              Four compartments. One neighbourhood kitchen. A lunch worth
              looking forward to.
            </p>
            <Link href="/explore" className="button-pop button-lime">
              Explore kitchens <ArrowRight size={17} />
            </Link>
            <span className="dabba-scroll-note"><Sparkles size={14} /> SCROLL TO UNPACK THE GOOD STUFF</span>
          </div>
        </div>
      </div>
    </section>
  );
}
