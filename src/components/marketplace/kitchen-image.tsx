"use client";

import Image from "next/image";
import { useState } from "react";

type KitchenImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function KitchenImage({
  src,
  alt,
  className = "",
  priority = false,
}: KitchenImageProps) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`kitchen-image-fallback ${className}`}
      >
        <span className="fallback-dabba" aria-hidden="true">♡</span>
        <span aria-hidden="true">A little taste of home</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
