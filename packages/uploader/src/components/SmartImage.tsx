"use client";

/**
 * SmartImage — Architecture-compliant image component for TapSleek
 *
 * Implements the image delivery strategy from IMAGE_ARCHITECTURE.md:
 * - AVIF as primary format
 * - WebP as fallback
 * - Responsive srcset via <picture> element
 * - Blur placeholder while loading
 * - Lazy loading by default (eager for above-the-fold)
 * - decoding="async" for non-blocking rendering
 *
 * Usage (current — single URL mode, backwards compatible):
 *   <SmartImage src="https://cdn.example.com/image.webp" alt="..." width={512} height={512} />
 *
 * Usage (future — variant mode, once backend returns basePath + variants):
 *   <SmartImage
 *     basePath="users/abc/avatar"
 *     variants={{ avif: { 256: "...", 512: "..." }, webp: { 256: "...", 512: "..." }, blur: "..." }}
 *     sizes="(max-width: 640px) 256px, 512px"
 *     alt="Profile photo"
 *   />
 */

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImageVariants {
  avif?: Record<string, string>;  // e.g. { "256": "url", "512": "url" }
  webp?: Record<string, string>;
  blur?: string;                  // URL for blur.webp placeholder
}

interface SmartImageBaseProps {
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  /** "lazy" (default) for below-the-fold, "eager" for LCP / above-the-fold images */
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
}

interface SmartImageSrcProps extends SmartImageBaseProps {
  /** Single URL — backwards compatible mode. Use when variants are not yet available. */
  src: string;
  basePath?: never;
  variants?: never;
}

interface SmartImageVariantProps extends SmartImageBaseProps {
  src?: never;
  /** Base path in R2, e.g. "users/abc/avatar" — used to construct variant URLs */
  basePath: string;
  /** Variant URLs returned by the API */
  variants: ImageVariants;
}

type SmartImageProps = SmartImageSrcProps | SmartImageVariantProps;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSrcSet(variants: Record<string, string>): string {
  return Object.entries(variants)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([size, url]) => `${url} ${size}w`)
    .join(", ");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SmartImage({
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  fill = false,
  objectFit = "cover",
  onLoad,
  ...rest
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // ── Variant mode (future-proof, used once backend returns variants) ──
  if ("basePath" in rest && rest.basePath) {
    const { basePath, variants } = rest as SmartImageVariantProps;
    const blurUrl = variants.blur;

    const avifSrcSet = variants.avif ? buildSrcSet(variants.avif) : undefined;
    const webpSrcSet = variants.webp ? buildSrcSet(variants.webp) : undefined;

    // Pick the largest WebP as the default <img> src fallback
    const defaultSrc = variants.webp
      ? Object.entries(variants.webp).sort(([a], [b]) => parseInt(b) - parseInt(a))[0]?.[1]
      : `${basePath}/512.webp`;

    return (
      <div className={cn("relative overflow-hidden", className)}>
        {/* Blur placeholder */}
        {blurUrl && !isLoaded && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blurUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm transition-opacity"
            style={{ opacity: isLoaded ? 0 : 1 }}
          />
        )}

        <picture>
          {avifSrcSet && (
            <source srcSet={avifSrcSet} type="image/avif" sizes={sizes} />
          )}
          {webpSrcSet && (
            <source srcSet={webpSrcSet} type="image/webp" sizes={sizes} />
          )}
          { }
          <img
            src={defaultSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            sizes={sizes}
            className={cn(
              "w-full h-full transition-opacity duration-300",
              `object-${objectFit}`,
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleLoad}
          />
        </picture>
      </div>
    );
  }

  // ── Single URL mode (current / backwards-compatible) ──
  const { src } = rest as SmartImageSrcProps;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(`object-${objectFit}`, className)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        sizes={sizes}
        onLoad={handleLoad}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 512}
      height={height ?? 512}
      className={cn(`object-${objectFit}`, className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      sizes={sizes}
      onLoad={handleLoad}
      priority={priority}
    />
  );
}

export default SmartImage;
