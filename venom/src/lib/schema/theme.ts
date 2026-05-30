import { z } from "zod";

export const themeColorsSchema = z
  .object({
    primary: z.string(),
    secondary: z.string(),
    background: z.string(),
    surface: z.string(),
    text: z.string(),
    textMuted: z.string(),
    accent: z.string(),
    border: z.string(),
  })
  .strict();

export const themeTypographySchema = z
  .object({
    fontHeading: z.string(),
    fontBody: z.string(),
    fontMono: z.string().optional(),
    scale: z.enum(["compact", "comfortable", "display"]).default("comfortable"),
  })
  .strict();

export const themeRadiusSchema = z
  .object({
    sm: z.string().default("4px"),
    md: z.string().default("8px"),
    lg: z.string().default("16px"),
    pill: z.string().default("9999px"),
  })
  .strict();

export const themeSpacingSchema = z
  .object({
    personality: z
      .enum(["compact", "normal", "spacious", "editorial"])
      .default("normal"),
    section: z.enum(["tight", "comfortable", "airy"]).default("comfortable"),
  })
  .strict();

export const themeShadowsSchema = z
  .object({
    sm: z.string().default("0 1px 2px rgba(0,0,0,.06)"),
    md: z.string().default("0 4px 12px rgba(0,0,0,.08)"),
    lg: z.string().default("0 12px 32px rgba(0,0,0,.12)"),
  })
  .strict();

export const themeAnimationSchema = z
  .object({
    ease: z.string().default("cubic-bezier(.4,0,.2,1)"),
    duration: z.string().default("200ms"),
    intensity: z
      .enum(["none", "subtle", "playful", "dramatic"])
      .default("subtle"),
  })
  .strict();

export const themeTokensSchema = z
  .object({
    colors: themeColorsSchema,
    typography: themeTypographySchema,
    radius: themeRadiusSchema.default({
      sm: "4px",
      md: "8px",
      lg: "16px",
      pill: "9999px",
    }),
    spacing: themeSpacingSchema.default({
      personality: "normal",
      section: "comfortable",
    }),
    shadows: themeShadowsSchema.default({
      sm: "0 1px 2px rgba(0,0,0,.06)",
      md: "0 4px 12px rgba(0,0,0,.08)",
      lg: "0 12px 32px rgba(0,0,0,.12)",
    }),
    animation: themeAnimationSchema.default({
      ease: "cubic-bezier(.4,0,.2,1)",
      duration: "200ms",
      intensity: "subtle",
    }),
  })
  .strict();

export type ThemeTokens = z.infer<typeof themeTokensSchema>;
export type ThemeColors = z.infer<typeof themeColorsSchema>;
