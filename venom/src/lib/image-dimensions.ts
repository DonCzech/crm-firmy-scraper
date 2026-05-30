export interface ImageDimensionPreset {
  aspect: number | null;
  sizes: string | null;
  widths: number[];
  priority?: boolean;
}

export const IMAGE_DIMENSIONS = {
  "hero":              { aspect: 5 / 2,  sizes: "100vw",                                                                  widths: [640, 960, 1280, 1600, 1920], priority: true },
  "hero-split":        { aspect: 4 / 3,  sizes: "(min-width:1024px) 50vw, 100vw",                                         widths: [320, 640, 960, 1280],         priority: true },
  "service-card":      { aspect: 4 / 3,  sizes: "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw",                 widths: [320, 480, 640, 960] },
  "blog-card":         { aspect: 4 / 3,  sizes: "(min-width:768px) 50vw, 100vw",                                          widths: [320, 480, 640, 960] },
  "gallery-tile":      { aspect: 1,      sizes: "(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw",                  widths: [240, 320, 480, 640] },
  "team-portrait":     { aspect: 3 / 4,  sizes: "(min-width:768px) 25vw, 50vw",                                           widths: [240, 320, 480] },
  "avatar":            { aspect: 1,      sizes: "80px",                                                                   widths: [80, 160] },
  "logo":              { aspect: null,   sizes: "200px",                                                                  widths: [160, 320] },
  "og-image":          { aspect: 1.91,   sizes: null,                                                                     widths: [1200] },
  "about-image":       { aspect: 3 / 2,  sizes: "(min-width:1024px) 50vw, 100vw",                                         widths: [320, 640, 960, 1280] },
  "testimonial-photo": { aspect: 1,      sizes: "80px",                                                                   widths: [80, 160] },
} as const satisfies Record<string, ImageDimensionPreset>;

export type ImageDimensionKey = keyof typeof IMAGE_DIMENSIONS;

const DEFAULT_PRESET: ImageDimensionPreset = {
  aspect: 16 / 9,
  sizes: "100vw",
  widths: [320, 640, 960, 1280, 1920],
};

export function getDimensionPreset(key: ImageDimensionKey | string | undefined): ImageDimensionPreset {
  if (!key) return DEFAULT_PRESET;
  const preset = (IMAGE_DIMENSIONS as Record<string, ImageDimensionPreset>)[key];
  return preset ?? DEFAULT_PRESET;
}
