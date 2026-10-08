import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { PresentationImage } from "../shared/PresentationImage";
import { Icon } from "../shared/Icon";

/** Optional local video sources; the current campaign uses its optimized still. */
export function CampaignMedia({
  webmSrc,
  mp4Src,
}: {
  webmSrc?: string;
  mp4Src?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const hasVideo = Boolean(webmSrc || mp4Src);
  useEffect(() => {
    if (!video.current) return;
    if (paused || reducedMotion) video.current.pause();
    else void video.current.play().catch(() => setFailed(true));
  }, [paused, reducedMotion, webmSrc, mp4Src]);
  return (
    <>
      <div
        className={`hero__media ${paused || reducedMotion ? "hero__media--paused" : ""}`}
      >
        <PresentationImage
          asset="hero"
          alt="Performance footwear campaign study with directional silver light"
          sizes="100vw"
          priority
        />
        {hasVideo && !reducedMotion && !failed && (
          <video
            ref={video}
            poster="/media/presentation/hero-1536.webp"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            onError={() => setFailed(true)}
            aria-hidden="true"
          >
            {webmSrc && <source src={webmSrc} type="video/webm" />}
            {mp4Src && <source src={mp4Src} type="video/mp4" />}
          </video>
        )}
      </div>
      <button
        className="campaign-motion"
        type="button"
        onClick={() => setPaused((value) => !value)}
        disabled={reducedMotion}
        aria-label={
          reducedMotion
            ? "Background motion disabled by your preference"
            : paused
              ? "Resume background motion"
              : "Pause background motion"
        }
      >
        <Icon name={paused || reducedMotion ? "play" : "pause"} size={14} />
        <span>
          {reducedMotion
            ? "Still perspective"
            : paused
              ? "Resume motion"
              : "Pause motion"}
        </span>
      </button>
    </>
  );
}
