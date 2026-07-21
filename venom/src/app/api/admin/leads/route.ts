import { NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { query, initDb } from "@/lib/db";

function getAdmin(req: NextRequest) {
  const cookies = req.headers.get("cookie") ?? "";
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyToken(match[1]);
}

// GET /api/admin/leads — poptávky z onboarding dotazníku „Uděláme to za vás"
export async function GET(request: NextRequest) {
  if (!getAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await initDb();
  const leads = await query<{
    id: number; project_type: string; goal: string; inspiration: string | null;
    current_web: string | null; budget: string; timeline: string | null;
    name: string; company: string | null; email: string; phone: string | null;
    locale: string; status: string; created_at: string;
  }>(
    `SELECT id, project_type, goal, inspiration, current_web, budget, timeline,
            name, company, email, phone, locale, status, created_at
       FROM agency_leads
      ORDER BY created_at DESC
      LIMIT 500`
  );

  return Response.json({ leads });
}

// PATCH /api/admin/leads — změna stavu poptávky ({ id, status })
export async function PATCH(request: NextRequest) {
  if (!getAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { id?: number; status?: string } | null;
  const allowed = ["new", "contacted", "won", "lost"];
  if (!body?.id || !body.status || !allowed.includes(body.status)) {
    return Response.json({ error: "Neplatná data" }, { status: 400 });
  }

  await query(`UPDATE agency_leads SET status = $1 WHERE id = $2`, [body.status, body.id]);
  return Response.json({ ok: true });
}
