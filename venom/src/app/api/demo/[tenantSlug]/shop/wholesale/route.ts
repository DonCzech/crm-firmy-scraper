import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug } from "@/lib/db";
import { isAddonActive } from "@/lib/commerce/addons";
import { requestWholesalePartner } from "@/lib/commerce/wholesale";

/** Modul „Velkoobchod (B2B)" — veřejná registrace partnera (čeká na schválení). */
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email(),
  company: z.string().trim().min(2).max(160),
  ico: z.string().trim().max(20).optional(),
  dic: z.string().trim().max(20).optional(),
  phone: z.string().trim().max(30).optional(),
  note: z.string().trim().max(1000).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "not found" }, { status: 404 });
  if (!(await isAddonActive(tenant.id, "velkoobchod"))) {
    return Response.json({ error: "Modul Velkoobchod není aktivní" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Vyplňte prosím e-mail a název firmy." }, { status: 400 });

  const res = await requestWholesalePartner(tenant.id, parsed.data);
  if ("error" in res) return Response.json({ error: res.error }, { status: 400 });
  return Response.json({ ok: true });
}
