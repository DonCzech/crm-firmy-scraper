"use client";

/** Client wrapper for SectionRenderer — needed because the renderer
    registry pulls in the freeform section with `ssr: false`, which Next 16
    does not allow inside a Server Component. */

import { SectionRenderer } from "@/components/tenant/SectionRenderer";
import type { Section } from "@/lib/db";

export function SectionPreviewClient({
  section, tenantId, tenantSlug,
}: { section: Section; tenantId: number; tenantSlug: string }) {
  return (
    <SectionRenderer
      section={section}
      tenantId={tenantId}
      tenantSlug={tenantSlug}
      isAdmin={false}
    />
  );
}
