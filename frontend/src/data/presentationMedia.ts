/** Generated art-direction studies, deliberately separate from future catalog records. */
export const presentationMedia = {
  hero: { width: 1536, height: 1024, sizes: [640, 960, 1536] },
  runner: { width: 960, height: 960, sizes: [320, 640, 960] },
  trail: { width: 960, height: 960, sizes: [320, 640, 960] },
  mono: { width: 960, height: 960, sizes: [320, 640, 960] },
  slide: { width: 960, height: 960, sizes: [320, 640, 960] },
  story: { width: 1536, height: 864, sizes: [640, 960, 1536] },
  texture: { width: 1536, height: 864, sizes: [640, 960, 1536] },
} as const;
export type PresentationMediaName = keyof typeof presentationMedia;
