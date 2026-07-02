import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key || key.startsWith('re_placeholder')) return { emails: { send: async () => {} } } as unknown as Resend
    _resend = new Resend(key)
  }
  return _resend
}
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'rezervace@noreply.com'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('cs-CZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(timeStr: string): string {
  return timeStr.substring(0, 5)
}

function addMinutesToTime(timeStr: string, minutes: number): string {
  const [hour, minute] = formatTime(timeStr).split(':').map(Number)
  const total = hour * 60 + minute + minutes
  const endHour = Math.floor(total / 60) % 24
  const endMinute = total % 60
  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
}

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Zdarma'
  return `${price.toLocaleString('cs-CZ')} ${currency}`
}

export async function sendBookingConfirmationToClient({
  clientName,
  clientEmail,
  serviceName,
  providerName,
  bookingDate,
  startTime,
  durationMinutes,
  price,
  currency,
  confirmationToken,
  appUrl,
}: {
  clientName: string
  clientEmail: string
  serviceName: string
  providerName: string
  bookingDate: string
  startTime: string
  durationMinutes: number
  price: number
  currency: string
  confirmationToken?: string
  appUrl?: string
}) {
  const endTime = addMinutesToTime(startTime, durationMinutes)

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rezervace potvrzena</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="background: #006bff; padding: 32px 40px; text-align: center;">
      <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span style="font-size: 28px;">✓</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Rezervace potvrzena</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Těšíme se na vás!</p>
    </div>
    <div style="padding: 32px 40px;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">Dobrý den, <strong>${clientName}</strong>,</p>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Vaše rezervace byla úspěšně potvrzena. Níže najdete detaily.</p>

      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px; width: 40%;">Služba</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Poskytovatel</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">${providerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Datum</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">${formatDate(bookingDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Čas</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">${formatTime(startTime)} – ${endTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Délka</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">${durationMinutes} minut</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Cena</td>
            <td style="padding: 8px 0; color: #006bff; font-size: 14px; font-weight: 600;">${formatPrice(price, currency)}</td>
          </tr>
        </table>
      </div>

      ${confirmationToken && appUrl ? `
      <div style="text-align: center; margin-top: 24px;">
        <a href="${appUrl}/booking/cancel/${confirmationToken}"
           style="display: inline-block; padding: 10px 24px; background: #fee2e2; color: #dc2626; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
          Zrušit rezervaci
        </a>
      </div>` : ''}
    </div>
    <div style="padding: 20px 40px; border-top: 1px solid #f3f4f6; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Tuto zprávu jste obdrželi jako potvrzení rezervace.</p>
    </div>
  </div>
</body>
</html>
  `

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: clientEmail,
      subject: `Rezervace potvrzena – ${serviceName}`,
      html,
    })
  } catch (error) {
    console.error('Failed to send confirmation email to client:', error)
  }
}

export async function sendBookingNotificationToProvider({
  providerEmail,
  providerName,
  clientName,
  clientEmail,
  clientPhone,
  clientNotes,
  serviceName,
  bookingDate,
  startTime,
  durationMinutes,
}: {
  providerEmail: string
  providerName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientNotes: string
  serviceName: string
  bookingDate: string
  startTime: string
  durationMinutes: number
}) {
  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Nová rezervace</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="background: #1e40af; padding: 28px 40px;">
      <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">🗓 Nová rezervace</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">Přijali jste novou rezervaci</p>
    </div>
    <div style="padding: 32px 40px;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">Dobrý den, <strong>${providerName}</strong>,</p>

      <h3 style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Klient</h3>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px; width: 40%;">Jméno</td>
            <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600;">${clientName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">E-mail</td>
            <td style="padding: 6px 0; color: #006bff; font-size: 14px;">${clientEmail}</td>
          </tr>
          ${clientPhone ? `<tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Telefon</td>
            <td style="padding: 6px 0; color: #111827; font-size: 14px;">${clientPhone}</td>
          </tr>` : ''}
          ${clientNotes ? `<tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Poznámky</td>
            <td style="padding: 6px 0; color: #374151; font-size: 14px;">${clientNotes}</td>
          </tr>` : ''}
        </table>
      </div>

      <h3 style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Rezervace</h3>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px; width: 40%;">Služba</td>
            <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Datum</td>
            <td style="padding: 6px 0; color: #111827; font-size: 14px;">${formatDate(bookingDate)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Čas</td>
            <td style="padding: 6px 0; color: #111827; font-size: 14px;">${formatTime(startTime)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Délka</td>
            <td style="padding: 6px 0; color: #111827; font-size: 14px;">${durationMinutes} minut</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
  `

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: providerEmail,
      subject: `Nová rezervace – ${clientName}`,
      html,
    })
  } catch (error) {
    console.error('Failed to send notification email to provider:', error)
  }
}

export async function sendReminderEmail({
  clientEmail,
  clientName,
  serviceName,
  providerName,
  bookingDate,
  startTime,
  durationMinutes,
  confirmationToken,
  appUrl,
}: {
  clientEmail: string
  clientName: string
  serviceName: string
  providerName: string
  bookingDate: string
  startTime: string
  durationMinutes: number
  confirmationToken: string
  appUrl: string
}) {
  const endTime = addMinutesToTime(startTime, durationMinutes)

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"><title>Připomenutí rezervace</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="background: #7c3aed; padding: 28px 40px; text-align: center;">
      <div style="font-size: 36px; margin-bottom: 12px;">🔔</div>
      <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">Připomenutí rezervace</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">Zítra vás čeká schůzka!</p>
    </div>
    <div style="padding: 32px 40px;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">Dobrý den, <strong>${clientName}</strong>,</p>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Připomínáme vám zítřejší rezervaci.</p>
      <div style="background: #f5f3ff; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #9ca3af; font-size: 13px; width: 40%;">Služba</td><td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600;">${serviceName}</td></tr>
          <tr><td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Poskytovatel</td><td style="padding: 6px 0; color: #111827; font-size: 14px;">${providerName}</td></tr>
          <tr><td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Datum</td><td style="padding: 6px 0; color: #111827; font-size: 14px;">${formatDate(bookingDate)}</td></tr>
          <tr><td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Čas</td><td style="padding: 6px 0; color: #7c3aed; font-size: 14px; font-weight: 600;">${formatTime(startTime)} – ${endTime}</td></tr>
        </table>
      </div>
      <div style="text-align: center;">
        <a href="${appUrl}/booking/cancel/${confirmationToken}"
           style="display: inline-block; padding: 10px 24px; background: #fee2e2; color: #dc2626; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
          Zrušit rezervaci
        </a>
      </div>
    </div>
  </div>
</body>
</html>`

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: clientEmail,
      subject: `Připomenutí: zítra ${formatTime(startTime)} – ${serviceName}`,
      html,
    })
  } catch (error) {
    console.error('Failed to send reminder email:', error)
  }
}

export async function sendCancellationEmail({
  clientEmail,
  clientName,
  serviceName,
  bookingDate,
  startTime,
}: {
  clientEmail: string
  clientName: string
  serviceName: string
  bookingDate: string
  startTime: string
}) {
  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Rezervace zrušena</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="background: #ef4444; padding: 28px 40px;">
      <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">Rezervace zrušena</h1>
    </div>
    <div style="padding: 32px 40px;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">Dobrý den, <strong>${clientName}</strong>,</p>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
        Vaše rezervace byla zrušena.
      </p>
      <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px; width: 40%;">Služba</td>
            <td style="padding: 6px 0; color: #111827; font-size: 14px;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Datum</td>
            <td style="padding: 6px 0; color: #111827; font-size: 14px;">${formatDate(bookingDate)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Čas</td>
            <td style="padding: 6px 0; color: #111827; font-size: 14px;">${formatTime(startTime)}</td>
          </tr>
        </table>
      </div>
      <p style="color: #6b7280; font-size: 13px;">
        Pokud chcete provést novou rezervaci, navštivte prosím naši stránku.
      </p>
    </div>
  </div>
</body>
</html>
  `

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: clientEmail,
      subject: 'Rezervace zrušena',
      html,
    })
  } catch (error) {
    console.error('Failed to send cancellation email:', error)
  }
}
