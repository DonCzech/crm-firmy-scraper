import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { sql, initDb } from '@/lib/db'

export async function GET() {
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await sql`
      SELECT id, email, name, slug, avatar_color, avatar_url, bio, timezone, min_booking_hours, buffer_minutes,
             payment_cash, payment_transfer, bank_iban, bank_owner, payment_note,
             require_email, require_phone,
             require_deposit, deposit_percent, sms_reminders, reminder_hours, default_locale, created_at
      FROM rez_users WHERE id = ${user.userId} LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const availability = await sql`
      SELECT * FROM rez_availability WHERE user_id = ${user.userId} ORDER BY day_of_week ASC
    `

    return NextResponse.json({ user: users[0], availability })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await initDb()
    const body = await request.json()

    if (body.availability) {
      // Update availability
      for (const day of body.availability) {
        await sql`
          INSERT INTO rez_availability (user_id, day_of_week, start_time, end_time, is_active)
          VALUES (${user.userId}, ${day.day_of_week}, ${day.start_time}, ${day.end_time}, ${day.is_active})
          ON CONFLICT (user_id, day_of_week) DO UPDATE SET
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            is_active = EXCLUDED.is_active
        `
      }
      return NextResponse.json({ success: true })
    }

    // Update profile
    const { name, email, slug, bio, avatar_color, avatar_url, timezone, min_booking_hours, buffer_minutes,
            payment_cash, payment_transfer, bank_iban, bank_owner, payment_note,
            require_email, require_phone,
            require_deposit, deposit_percent, sms_reminders, reminder_hours, default_locale } = body

    await sql`
      UPDATE rez_users SET
        name = COALESCE(${name ?? null}, name),
        email = COALESCE(${email ?? null}, email),
        slug = COALESCE(${slug ?? null}, slug),
        bio = COALESCE(${bio ?? null}, bio),
        avatar_color = COALESCE(${avatar_color ?? null}, avatar_color),
        avatar_url = COALESCE(${avatar_url ?? null}, avatar_url),
        timezone = COALESCE(${timezone ?? null}, timezone),
        min_booking_hours = COALESCE(${min_booking_hours ?? null}, min_booking_hours),
        buffer_minutes = COALESCE(${buffer_minutes ?? null}, buffer_minutes),
        payment_cash = COALESCE(${payment_cash ?? null}, payment_cash),
        payment_transfer = COALESCE(${payment_transfer ?? null}, payment_transfer),
        bank_iban = COALESCE(${bank_iban ?? null}, bank_iban),
        bank_owner = COALESCE(${bank_owner ?? null}, bank_owner),
        payment_note = COALESCE(${payment_note ?? null}, payment_note),
        require_email = COALESCE(${require_email ?? null}, require_email),
        require_phone = COALESCE(${require_phone ?? null}, require_phone),
        require_deposit = COALESCE(${require_deposit ?? null}, require_deposit),
        deposit_percent = COALESCE(${deposit_percent ?? null}, deposit_percent),
        sms_reminders = COALESCE(${sms_reminders ?? null}, sms_reminders),
        reminder_hours = COALESCE(${reminder_hours ?? null}, reminder_hours),
        default_locale = COALESCE(${default_locale ?? null}, default_locale)
      WHERE id = ${user.userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
