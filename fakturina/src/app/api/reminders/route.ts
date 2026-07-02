import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  before_due_enabled: z.boolean(),
  due_day_enabled: z.boolean(),
  after_3_days_enabled: z.boolean(),
  after_10_days_enabled: z.boolean(),
  after_20_days_enabled: z.boolean(),
  email_template_before_due: z.string(),
  email_template_due_day: z.string(),
  email_template_after_due: z.string(),
});

export async function POST(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });

  const d = parsed.data;
  const { rows: existing } = await query(
    "SELECT id FROM fak_reminder_settings WHERE company_id = $1",
    [company.id]
  );

  if (existing.length > 0) {
    await query(
      `UPDATE fak_reminder_settings SET
         before_due_enabled=$1, due_day_enabled=$2, after_3_days_enabled=$3,
         after_10_days_enabled=$4, after_20_days_enabled=$5,
         email_template_before_due=$6, email_template_due_day=$7, email_template_after_due=$8
       WHERE company_id=$9`,
      [d.before_due_enabled, d.due_day_enabled, d.after_3_days_enabled,
       d.after_10_days_enabled, d.after_20_days_enabled,
       d.email_template_before_due, d.email_template_due_day, d.email_template_after_due,
       company.id]
    );
  } else {
    await query(
      `INSERT INTO fak_reminder_settings
         (id, company_id, before_due_enabled, due_day_enabled, after_3_days_enabled,
          after_10_days_enabled, after_20_days_enabled, email_template_before_due,
          email_template_due_day, email_template_after_due)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [randomUUID(), company.id, d.before_due_enabled, d.due_day_enabled, d.after_3_days_enabled,
       d.after_10_days_enabled, d.after_20_days_enabled,
       d.email_template_before_due, d.email_template_due_day, d.email_template_after_due]
    );
  }

  return NextResponse.json({ ok: true });
}
