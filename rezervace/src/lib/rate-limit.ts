// Jednoduchý in-memory rate limiter (sliding window). V serverless prostředí je
// stav per-instance, takže to není tvrdá kvóta, ale spolehlivě utlumí bursty
// od jednoho klienta na téže instanci — levná první obrana proti spam-botům.
// Pro tvrdé limity by bylo potřeba sdílené úložiště (Redis/Upstash).

type Hit = { count: number; resetAt: number }
const buckets = new Map<string, Hit>()

// Občasný úklid, ať mapa neroste donekonečna.
let lastSweep = 0
function sweep(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, hit] of buckets) {
    if (hit.resetAt < now) buckets.delete(key)
  }
}

export function rateLimit(
  key: string,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now()
  sweep(now)

  const hit = buckets.get(key)
  if (!hit || hit.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  hit.count++
  if (hit.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((hit.resetAt - now) / 1000) }
  }
  return { ok: true, remaining: limit - hit.count, retryAfter: 0 }
}

// Vytáhne IP klienta z hlaviček (za proxy/Vercel).
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || '0.0.0.0'
}
