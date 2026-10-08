import {
  presentationMedia,
  type PresentationMediaName,
} from "../../data/presentationMedia";

export function PresentationImage({
  asset,
  alt,
  sizes,
  className = "",
  priority = false,
}: {
  asset: PresentationMediaName;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const media = presentationMedia[asset];
  return (
    <img
      className={`presentation-image ${className}`}
      src={`/media/presentation/${asset}-${media.width}.webp`}
      srcSet={media.sizes
        .map((width) => `/media/presentation/${asset}-${width}.webp ${width}w`)
        .join(", ")}
      sizes={sizes}
      width={media.width}
      height={media.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
