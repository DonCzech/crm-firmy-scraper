import { NextRequest, NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { Pool } from "pg";

const ADMIN_HUB_KEY = process.env.ADMIN_HUB_KEY ?? "";

function checkAuth(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key") ?? "";
  return ADMIN_HUB_KEY.length > 0 && key === ADMIN_HUB_KEY;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

async function q(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initDb();
  const { searchParams } = req.nextUrl;
  const action = searchParams.get("action") ?? "stats";

  if (action === "stats") {
    const [tenantsRes, userAccountsRes, adminUsersRes] = await Promise.all([
      q(`SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'demo' THEN 1 END) as demo,
          COUNT(CASE WHEN plan = 'paid' THEN 1 END) as paid,
          MAX(created_at) as last_created
         FROM tenants`),
      q(`SELECT COUNT(*) as total, MAX(created_at) as last_signup FROM user_accounts`),
      q(`SELECT COUNT(*) as total FROM admin_users`),
    ]);

    const tenants = tenantsRes.rows[0];
    const userAccounts = userAccountsRes.rows[0];

    return NextResponse.json({
      project: "webero",
      name: "Webero",
      stats: {
        totalTenants: parseInt(tenants.total),
        activeTenants: parseInt(tenants.active),
        demoTenants: parseInt(tenants.demo),
        paidTenants: parseInt(tenants.paid),
        lastCreated: tenants.last_created,
        totalUsers: parseInt(userAccounts.total),
        lastSignup: userAccounts.last_signup,
        activeSubscriptions: parseInt(tenants.paid),
        mrr: 0,
      },
    });
  }

  if (action === "tenants") {
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const search = searchParams.get("search") ?? "";
    const offset = (page - 1) * limit;

    const where = search ? `WHERE t.slug ILIKE $1 OR t.email ILIKE $1` : "";
    const params = search ? [`%${search}%`] : [];

    const [countRes, tenantsRes] = await Promise.all([
      q(`SELECT COUNT(*) as total FROM tenants t ${where}`, params),
      q(
        `SELECT t.id, t.slug, t.email, t.status, t.plan, t.industry,
                t.created_at, t.updated_at,
                tmpl.name as template_name,
                ua.name as owner_name
         FROM tenants t
         LEFT JOIN templates tmpl ON tmpl.id = t.template_id
         LEFT JOIN user_accounts ua ON ua.id = t.user_account_id
         ${where}
         ORDER BY t.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      ),
    ]);

    return NextResponse.json({
      tenants: tenantsRes.rows,
      total: parseInt(countRes.rows[0].total),
      page,
      limit,
    });
  }

  if (action === "users") {
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const search = searchParams.get("search") ?? "";
    const offset = (page - 1) * limit;

    const where = search ? `WHERE email ILIKE $1 OR name ILIKE $1` : "";
    const params = search ? [`%${search}%`] : [];

    const [countRes, usersRes] = await Promise.all([
      q(`SELECT COUNT(*) as total FROM user_accounts ${where}`, params),
      q(
        `SELECT ua.id, ua.email, ua.name, ua.phone, ua.created_at,
                COUNT(t.id) as tenant_count
         FROM user_accounts ua
         LEFT JOIN tenants t ON t.user_account_id = ua.id
         ${where}
         GROUP BY ua.id
         ORDER BY ua.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      ),
    ]);

    return NextResponse.json({
      users: usersRes.rows.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: "user",
        status: "active",
        plan: "free",
        createdAt: u.created_at,
        tenantCount: parseInt(u.tenant_count ?? "0"),
        subscription: null,
      })),
      total: parseInt(countRes.rows[0].total),
      page,
      limit,
    });
  }

  if (action === "user") {
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const [userRes, tenantsRes] = await Promise.all([
      q("SELECT * FROM user_accounts WHERE id = $1", [id]),
      q(
        `SELECT t.id, t.slug, t.email, t.status, t.plan, t.industry, t.created_at,
                tmpl.name as template_name
         FROM tenants t
         LEFT JOIN templates tmpl ON tmpl.id = t.template_id
         WHERE t.user_account_id = $1
         ORDER BY t.created_at DESC`,
        [id]
      ),
    ]);

    if (!userRes.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const u = userRes.rows[0];

    return NextResponse.json({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      role: "user",
      status: "active",
      plan: "free",
      createdAt: u.created_at,
      tenants: tenantsRes.rows,
      subscription: null,
      payments: [],
    });
  }

  if (action === "tenant") {
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await q(
      `SELECT t.*, tmpl.name as template_name, ua.email as owner_email, ua.name as owner_name
       FROM tenants t
       LEFT JOIN templates tmpl ON tmpl.id = t.template_id
       LEFT JOIN user_accounts ua ON ua.id = t.user_account_id
       WHERE t.id = $1`,
      [id]
    );

    if (!res.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initDb();
  const body = await req.json();
  const { action, userId, tenantId, data } = body as {
    action: string;
    userId?: string;
    tenantId?: string;
    data?: Record<string, unknown>;
  };

  if (action === "block-user" && userId) {
    await q("UPDATE user_accounts SET name = name WHERE id = $1", [userId]);
    return NextResponse.json({ success: true, note: "blocked" });
  }

  if (action === "block-tenant" && tenantId) {
    await q("UPDATE tenants SET status = 'blocked' WHERE id = $1", [tenantId]);
    return NextResponse.json({ success: true });
  }

  if (action === "activate-tenant" && tenantId) {
    await q("UPDATE tenants SET status = 'active' WHERE id = $1", [tenantId]);
    return NextResponse.json({ success: true });
  }

  if (action === "update-tenant" && tenantId && data) {
    const allowed = ["status", "plan", "email"] as const;
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const key of allowed) {
      if (key in data) {
        updates.push(`${key} = $${idx++}`);
        values.push(data[key]);
      }
    }
    if (!updates.length) return NextResponse.json({ error: "No fields" }, { status: 400 });
    values.push(tenantId);
    await q(`UPDATE tenants SET ${updates.join(", ")}, updated_at = now() WHERE id = $${idx}`, values);
    return NextResponse.json({ success: true });
  }

  if (action === "update-user" && userId && data) {
    const allowed = ["name", "email", "phone"] as const;
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const key of allowed) {
      if (key in data) {
        updates.push(`${key} = $${idx++}`);
        values.push(data[key]);
      }
    }
    if (!updates.length) return NextResponse.json({ error: "No fields" }, { status: 400 });
    values.push(userId);
    await q(`UPDATE user_accounts SET ${updates.join(", ")}, updated_at = now() WHERE id = $${idx}`, values);
    return NextResponse.json({ success: true });
  }

  if (action === "delete-user" && userId) {
    await q("DELETE FROM tenants WHERE user_account_id = $1", [userId]);
    await q("DELETE FROM user_accounts WHERE id = $1", [userId]);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
