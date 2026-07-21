type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

/**
 * Per-instance safety net. Production should additionally enforce a distributed
 * limit at the edge/WAF; this limiter deliberately fails closed per instance.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }
  current.count += 1;
  if (buckets.size > 10_000) {
    buckets.forEach((value, bucketKey) => {
      if (value.resetAt <= now) buckets.delete(bucketKey);
    });
  }
  return {
    allowed: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}
