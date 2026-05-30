import { z } from "zod";

export const sectionRefSchema = z
  .object({
    type: z.string().min(1),
    variant: z.string().min(1).default("default"),
    contentRef: z.string().optional(),
    hidden: z.boolean().optional(),
    anchorId: z.string().optional(),
  })
  .strict();

export type SectionRef = z.infer<typeof sectionRefSchema>;

export const pageSchema = z
  .object({
    slug: z.string().min(1),
    isHomepage: z.boolean().optional(),
    titleKey: z.string().optional(),
    title: z.string().optional(),
    seoTitleKey: z.string().optional(),
    seoDescriptionKey: z.string().optional(),
    sections: z.array(sectionRefSchema),
  })
  .strict();

export type PageManifest = z.infer<typeof pageSchema>;

export const i18nSchema = z
  .object({
    default: z.string().default("cs"),
    supported: z.array(z.string()).default(["cs"]),
  })
  .strict();

export const contentRefsSchema = z
  .object({
    default: z.string(),
    en: z.string().optional(),
    sk: z.string().optional(),
  })
  .passthrough();

export const templateManifestSchema = z
  .object({
    $schema: z.string().optional(),
    key: z
      .string()
      .regex(/^[a-z0-9-]+$/, "key must be kebab-case alphanumeric"),
    name: z.string().min(1),
    industry: z.string().min(1),
    version: z.string().min(1),
    description: z.string().optional(),
    baseTemplate: z.string().nullable().optional(),
    // Section-by-section workflow (docs/SECTION_WORKFLOW.md):
    skeleton: z.string().optional(),
    sectionOrderNote: z.string().optional(),
    skippedSections: z
      .array(
        z.object({
          pos: z.number().int().nonnegative(),
          name: z.string(),
          reason: z.string(),
        })
      )
      .optional(),
    extraSections: z
      .array(
        z.object({
          type: z.string(),
          name: z.string().optional(),
          reason: z.string(),
        })
      )
      .optional(),
    i18n: i18nSchema.default({ default: "cs", supported: ["cs"] }),
    pages: z.array(pageSchema).min(1),
    content: contentRefsSchema.optional(),
    images: z
      .object({ manifest: z.string().optional() })
      .passthrough()
      .optional(),
  })
  .strict();

export type TemplateManifest = z.infer<typeof templateManifestSchema>;
