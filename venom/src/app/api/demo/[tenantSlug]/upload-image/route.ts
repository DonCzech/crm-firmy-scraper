import { NextRequest } from "next/server";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { uploadMedia } from "@/lib/media-storage";
import { IMAGE_DIMENSIONS, type ImageDimensionKey } from "@/lib/image-dimensions";
import { IMAGE_SLOTS, slotToUploadOptions } from "@/lib/image-slots";
import { query, auditLog } from "@/lib/db";

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

/**
 * F3 wire-up — tenant-scoped image upload with slot/dimensions support.
 *
 * Body (multipart/form-data):
 *   file               File           required
 *   slot               string         optional — key in IMAGE_SLOTS (24 canonical slots)
 *   dimensions         string         optional — key in IMAGE_DIMENSIONS (responsive preset)
 *   targetWidth        number         optional — override target px width (1–5000)
 *   targetHeight       number         optional — override target px height (1–5000)
 *   fit                "cover"|"contain"  optional, default "cover"
 *   responsive         "true"|"false"     optional
 *
 * Precedence: explicit targetWidth/Height > slot > dimensions > none.
 *
 * Result is per-tenant resized + WebP + JPEG fallback + LQIP + (optional)
 * responsive srcset variants. Record kept in `media` table.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  // Resolve target dimensions: explicit override → slot → dimensions preset → none
  let targetWidth = parseUploadNumber(formData.get("targetWidth"));
  let targetHeight = parseUploadNumber(formData.get("targetHeight"));
  let fit: "cover" | "contain" = formData.get("fit") === "contain" ? "contain" : "cover";
  let responsive = formData.get("responsive") === "true";
  let widths: number[] | undefined;

  const slotKey = (formData.get("slot") as string | null)?.trim();
  if (slotKey && slotKey in IMAGE_SLOTS) {
    const opts = slotToUploadOptions(slotKey);
    if (targetWidth === null) targetWidth = opts.targetWidth;
    if (targetHeight === null) targetHeight = opts.targetHeight;
    if (formData.get("fit") === null) fit = opts.fit;
    if (formData.get("responsive") === null) responsive = opts.responsive;
    widths = opts.widths;
  }

  const dimensionsKey = (formData.get("dimensions") as string | null) ?? null;
  if (dimensionsKey && dimensionsKey in IMAGE_DIMENSIONS) {
    const preset = IMAGE_DIMENSIONS[dimensionsKey as ImageDimensionKey];
    responsive = true;
    if (!widths) widths = [...preset.widths];
  }

  try {
    const result = await uploadMedia(file, tenant.id, {
      targetWidth,
      targetHeight,
      fit,
      responsive,
      widths,
    });

    await query(
      `INSERT INTO media (tenant_id, filename, original_name, url, mime_type, size_bytes, width, height)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [tenant.id, result.filename, file.name, result.url, result.mimeType, result.sizeBytes, result.width, result.height]
    );

    await auditLog("media_uploaded", {
      tenantId: tenant.id,
      targetType: "media",
      extra: {
        filename: file.name,
        slot: slotKey ?? null,
        dimensions: dimensionsKey ?? null,
        originalSize: file.size,
        optimizedSize: result.sizeBytes,
        width: result.width,
        height: result.height,
      },
    });

    return Response.json({
      url: result.url,
      jpegUrl: result.jpegUrl,
      width: result.width,
      height: result.height,
      mimeType: result.mimeType,
      sizeBytes: result.sizeBytes,
      jpegSizeBytes: result.jpegSizeBytes,
      variants: result.variants ?? null,
      lqip: result.lqip ?? null,
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}

function parseUploadNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5000) return null;
  return parsed;
}
