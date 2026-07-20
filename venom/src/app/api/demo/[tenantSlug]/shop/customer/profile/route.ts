import { NextRequest, NextResponse } from "next/server";
import { initCommerceDb } from "@/lib/commerce/schema";
import { parseSessionToken, getCustomerProfile, updateCustomerProfile, getCustomerOrders, getCustomerOrderDetail, changePassword } from "@/lib/commerce/customer-auth";

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
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");

    if (section === "orders") {
      const page = Number(searchParams.get("page") || 1);
      const orders = await getCustomerOrders(session.tid, session.cid, page);
      return NextResponse.json(orders);
    }

    if (section === "order") {
      const orderId = Number(searchParams.get("id"));
      if (!orderId) return NextResponse.json({ error: "id required" }, { status: 400 });
      const order = await getCustomerOrderDetail(session.tid, session.cid, orderId);
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      return NextResponse.json({ order });
    }

    const profile = await getCustomerProfile(session.tid, session.cid);
    return NextResponse.json({ profile });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  await params;
  await initCommerceDb();

  const session = getCustomerFromToken(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (body.action === "change_password") {
      const ok = await changePassword(session.tid, session.cid, body.oldPassword, body.newPassword);
      return NextResponse.json({ ok });
    }

    const profile = await updateCustomerProfile(session.tid, session.cid, body);
    return NextResponse.json({ profile });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
