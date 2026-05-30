export { barberTemplate } from "./barber";
export { wellnessTemplate } from "./wellness";
export { lawyerTemplate } from "./lawyer";
export { asteraTemplate } from "./astera";
export { cafe01Template } from "./cafe-01";
export type { TemplateDefinition, DesignTokens, SectionConfig } from "./types";

import { barberTemplate } from "./barber";
import { wellnessTemplate } from "./wellness";
import { lawyerTemplate } from "./lawyer";
import { asteraTemplate } from "./astera";
import { cafe01Template } from "./cafe-01";
import type { TemplateDefinition } from "./types";

export const TEMPLATES: Record<string, TemplateDefinition> = {
  "barber-01": barberTemplate,
  barber: barberTemplate,
  wellness: wellnessTemplate,
  lawyer: lawyerTemplate,
  astera: asteraTemplate,
  "cafe-01": cafe01Template,
};

export function getTemplateSync(key: string): TemplateDefinition | null {
  return TEMPLATES[key] ?? null;
}

export async function getTemplate(key: string): Promise<TemplateDefinition | null> {
  try {
    const { loadTemplate } = await import("./loader");
    return await loadTemplate(key);
  } catch {
    return TEMPLATES[key] ?? null;
  }
}
