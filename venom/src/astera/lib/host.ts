/**
 * Host glue for the astera module running inside Venom.
 *
 * The astera components were written for astera-web's own single-site API
 * (`/api/upload`, `/api/wheel`, `/api/contact`). When mounted inside a Venom
 * tenant these need tenant scoping. Rather than editing every fetch site to
 * thread a tenantSlug, the astera ContentProvider records the active tenant
 * here on mount and the thin helpers below attach it. This keeps the astera
 * components essentially 1:1.
 *
 * One tenant is rendered per page, so a module-scoped value is safe. All calls
 * happen client-side from user interaction, well after the provider mounts.
 */

let activeTenantSlug: string | null = null;

export function setAsteraHostTenant(slug: string | null) {
  activeTenantSlug = slug ?? null;
}

export function getAsteraHostTenant(): string | null {
  return activeTenantSlug;
}

/** Upload an image via Venom's tenant-scoped upload route. Returns the raw Response. */
export async function asteraUpload(fd: FormData): Promise<Response> {
  if (activeTenantSlug && !fd.has("tenantSlug")) {
    fd.append("tenantSlug", activeTenantSlug);
  }
  return fetch("/api/upload", { method: "POST", body: fd });
}

/** Base path for the astera wheel-of-fortune lead endpoint (tenant-scoped in Venom). */
export function asteraWheelUrl(): string {
  return activeTenantSlug ? `/api/demo/${activeTenantSlug}/wheel` : "/api/wheel";
}

/** Base path for the astera contact form endpoint (tenant-scoped in Venom). */
export function asteraContactUrl(): string {
  return activeTenantSlug ? `/api/demo/${activeTenantSlug}/contact` : "/api/contact";
}
