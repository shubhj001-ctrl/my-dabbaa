import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  compact?: boolean;
  inverse?: boolean;
};

export function BrandMark({
  href = "/",
  compact = false,
  inverse = false,
}: BrandMarkProps) {
  return (
    <Link
      href={href}
      className={`brand-mark ${inverse ? "brand-mark-inverse" : ""} ${
        compact ? "brand-mark-compact" : ""
      }`}
      aria-label="My Dabbaa home"
    >
      <span className="dabba-symbol" aria-hidden="true">
        <span />
        <span />
        <i />
      </span>
      {!compact ? (
        <span className="brand-wordmark">
          my <b>dabbaa</b>
        </span>
      ) : null}
    </Link>
  );
}
