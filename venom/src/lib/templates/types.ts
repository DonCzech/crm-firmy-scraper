export interface DesignTokens {
  colorPrimary: string;
  colorSecondary: string;
  colorBackground: string;
  colorSurface: string;
  colorText: string;
  colorTextMuted: string;
  colorAccent: string;
  colorBorder: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: string;
  spacing: "compact" | "normal" | "relaxed";
}

export interface SectionConfig {
  type: string;
  variant: string;
  order: number;
  visible: boolean;
  anchorId?: string;
  content?: Record<string, unknown>;
}

export interface TemplatePageDefinition {
  slug: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  sections: Array<SectionConfig & { content: Record<string, unknown> }>;
}

export interface TemplateDefinition {
  key: string;
  name: string;
  industry: string;
  version: string;
  designTokens: DesignTokens;
  defaultSections: SectionConfig[];
  pages?: TemplatePageDefinition[];
  demoContent: Record<string, unknown>;
}
