// Generování iCalendar (.ics) — jednotlivá událost do potvrzovacího e-mailu i
// celý feed pro odběr v Google/Apple kalendáři. Bez závislostí.

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

// Formát UTC bez oddělovačů: 20260724T130000Z
function toIcsUtc(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

function escapeText(s: string): string {
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// Řádky iCal se mají lámat na 75 oktetů; jednoduché zalomení pro dlouhé hodnoty.
function fold(line: string): string {
  if (line.length <= 74) return line
  const chunks: string[] = []
  let s = line
  chunks.push(s.slice(0, 74))
  s = s.slice(74)
  while (s.length > 73) {
    chunks.push(' ' + s.slice(0, 73))
    s = s.slice(73)
  }
  if (s.length) chunks.push(' ' + s)
  return chunks.join('\r\n')
}

export interface IcsEvent {
  uid: string
  title: string
  description?: string
  location?: string
  // Lokální datum/čas ve tvaru 'YYYY-MM-DD' a 'HH:mm'
  date: string
  startTime: string
  durationMinutes: number
  // Offset zdrojové zóny vůči UTC v minutách (default Praha; DST neřešíme přesně,
  // pro potřeby připomínky/add-to-calendar dostačující).
  tzOffsetMinutes?: number
  status?: 'CONFIRMED' | 'CANCELLED'
  organizerName?: string
}

function eventLines(ev: IcsEvent): string[] {
  const [y, m, d] = ev.date.split('-').map(Number)
  const [hh, mm] = ev.startTime.split(':').map(Number)
  const offset = ev.tzOffsetMinutes ?? 120 // Europe/Prague ~ +120 (léto); zjednodušení
  // Lokální čas → UTC odečtením offsetu
  const startUtc = new Date(Date.UTC(y, m - 1, d, hh, mm) - offset * 60_000)
  const endUtc = new Date(startUtc.getTime() + ev.durationMinutes * 60_000)

  return [
    'BEGIN:VEVENT',
    `UID:${ev.uid}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(startUtc)}`,
    `DTEND:${toIcsUtc(endUtc)}`,
    fold(`SUMMARY:${escapeText(ev.title)}`),
    ev.description ? fold(`DESCRIPTION:${escapeText(ev.description)}`) : '',
    ev.location ? fold(`LOCATION:${escapeText(ev.location)}`) : '',
    ev.organizerName ? fold(`ORGANIZER;CN=${escapeText(ev.organizerName)}:mailto:noreply@rezora.cz`) : '',
    `STATUS:${ev.status || 'CONFIRMED'}`,
    'END:VEVENT',
  ].filter(Boolean)
}

export function buildIcsEvent(ev: IcsEvent): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rezora//Booking//CS',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...eventLines(ev),
    'END:VCALENDAR',
  ].join('\r\n')
}

export function buildIcsFeed(name: string, events: IcsEvent[]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rezora//Booking//CS',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    fold(`X-WR-CALNAME:${escapeText(name)}`),
    'X-WR-TIMEZONE:Europe/Prague',
    ...events.flatMap(eventLines),
    'END:VCALENDAR',
  ].join('\r\n')
}
