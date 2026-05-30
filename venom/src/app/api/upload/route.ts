import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/demo-auth";
import { uploadMedia } from "@/lib/media-storage";
import { IMAGE_DIMENSIONS, type ImageDimensionKey } from "@/lib/image-dimensions";
import { query, auditLog } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const tenantSlug = formData.get("tenantSlug") as string | null;
  const targetWidth = parseUploadNumber(formData.get("targetWidth"));
  const targetHeight = parseUploadNumber(formData.get("targetHeight"));
  const fit = formData.get("fit") === "contain" ? "contain" : "cover";
  const responsive = formData.get("responsive") === "true";
  const dimensionsKey = (formData.get("dimensions") as string | null) ?? null;
  const dimensionPreset = dimensionsKey && dimensionsKey in IMAGE_DIMENSIONS
    ? IMAGE_DIMENSIONS[dimensionsKey as ImageDimensionKey]
    : null;
  const effectiveResponsive = responsive || Boolean(dimensionPreset);
  const widths = dimensionPreset ? [...dimensionPreset.widths] : undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const isPlatformAdmin = Boolean(token && verifyToken(token));

  if (!file) {
    return Response.json({ error: "Soubor nebyl nahrán" }, { status: 400 });
  }

  // Resolve tenant_id — required for media isolation
  let tenantId = 0;
  if (tenantSlug) {
    const rows = await query<{ id: number; access_token: string | null }>(
      "SELECT id, access_token FROM tenants WHERE slug = $1",
      [tenantSlug]
    );
    if (!rows.length) {
      return Response.json({ error: "Tenant not found" }, { status: 404 });
    }
    const tenantAccess = cookieStore.get(`venom_access_${tenantSlug}`)?.value;
    const isTenantAdmin = Boolean(rows[0].access_token && tenantAccess === rows[0].access_token);
    if (!isPlatformAdmin && !isTenantAdmin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    tenantId = rows[0].id;
  } else if (!isPlatformAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await uploadMedia(file, tenantId, {
      targetWidth,
      targetHeight,
      fit,
      responsive: effectiveResponsive,
      widths,
    });

    // Record media in DB for tenant
    if (tenantId > 0) {
      await query(
        `INSERT INTO media (tenant_id, filename, original_name, url, mime_type, size_bytes, width, height)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [tenantId, result.filename, file.name, result.url, result.mimeType, result.sizeBytes, result.width, result.height]
      );

      await auditLog("media_uploaded", {
        tenantId,
        targetType: "media",
        extra: {
          filename: file.name,
          originalSize: file.size,
          optimizedSize: result.sizeBytes,
          jpegSize: result.jpegSizeBytes,
          width: result.width,
          height: result.height,
          mimeType: result.mimeType,
        },
      });
    }

    return Response.json({
      url: result.url,
      width: result.width,
      height: result.height,
      mimeType: result.mimeType,
      sizeBytes: result.sizeBytes,
      jpegUrl: result.jpegUrl,
      jpegSizeBytes: result.jpegSizeBytes,
      variants: result.variants ?? null,
      lqip: result.lqip ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 400 });
  }
}

function parseUploadNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5000) return null;
  return parsed;
}
