import { NextRequest } from "next/server";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { uploadMedia } from "@/lib/media-storage";

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  try {
    const result = await uploadMedia(file, tenant.id);
    return Response.json({
      url: result.url,
      jpegUrl: result.jpegUrl,
      width: result.width,
      height: result.height,
      lqip: result.lqip ?? null,
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
