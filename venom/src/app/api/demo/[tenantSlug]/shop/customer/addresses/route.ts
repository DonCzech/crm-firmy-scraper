import { NextRequest, NextResponse } from "next/server";
import { initCommerceDb } from "@/lib/commerce/schema";
import { parseSessionToken, getCustomerAddresses, saveCustomerAddress, deleteCustomerAddress } from "@/lib/commerce/customer-auth";

export const dynamic = "force-dynamic";

function getCustomerFromToken(req: NextRequest): { cid: number; tid: number } | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return parseSessionToken(auth.slice(7));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  await params;
  await initCommerceDb();

  const session = getCustomerFromToken(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const addresses = await getCustomerAddresses(session.tid, session.cid);
    return NextResponse.json({ addresses });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  await params;
  await initCommerceDb();

  const session = getCustomerFromToken(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const address = await saveCustomerAddress(session.tid, session.cid, { ...body, kind: body.kind || "shipping" });
    return NextResponse.json({ address });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  await params;
  await initCommerceDb();

  const session = getCustomerFromToken(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const addressId = Number(searchParams.get("id"));
    if (!addressId) return NextResponse.json({ error: "id required" }, { status: 400 });
    await deleteCustomerAddress(session.tid, session.cid, addressId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
