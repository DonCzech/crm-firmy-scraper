# Vercel Cron setup

Five cron jobs are configured in [`vercel.json`](../vercel.json):

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/publish-scheduled` | `0 8 * * *` | Publish blog posts whose `scheduled_at` passed |
| `/api/cron/cleanup-inactive` | `0 3 * * *` | Tenant lifecycle cleanup |
| `/api/cron/seed-templates` | `15 * * * *` | Hourly disk → DB template sync (checksum-skip) |
| `/api/cron/daily-residue-audit` | `0 3 * * *` | Daily residue regression scan to `audit_log` |
| `/api/cron/warmup-renders` | `30 * * * *` | Hourly render warmup for up to 20 idle v2 tenants |

## Required environment variable

All cron endpoints check `x-cron-secret` header against `CRON_SECRET`. Vercel
sends this header automatically when invoking the configured paths.

## Setup

### 1. Add to Vercel (production + preview)

```sh
cd venom

# Production
vercel env add CRON_SECRET production
# Paste a strong random value, e.g.:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Preview (optional — preview deployments don't run cron by default)
vercel env add CRON_SECRET preview
```

### 2. Add to local dev (optional)

Append to `.env.local`:

```
CRON_SECRET=<the same value you set in Vercel>
```

Then locally you can hit an endpoint manually:

```sh
curl -H "x-cron-secret: $CRON_SECRET" http://localhost:3015/api/cron/seed-templates
```

### 3. Verify after deploy

Vercel dashboard → Project → Settings → Cron Jobs shows the schedule and
last-invocation status. Manual invoke is available from there too.

`audit_log` entries appear with `action`:
- `cron_seed_templates` — when any template content changed
- `cron_residue_audit` — every day at 03:00 UTC
- `cron_warmup_renders` — every hour at :30

## Bypass / disable

To temporarily disable a cron without removing it from version control:

1. Comment out the entry in `vercel.json` and redeploy, OR
2. Set `CRON_SECRET=disabled` in Vercel env — endpoints will reject all
   incoming requests (Vercel keeps trying but logs 401).

## What happens if `CRON_SECRET` is unset?

If the env var is missing, `process.env.CRON_SECRET ?? ""` resolves to `""`.
Vercel sends a non-empty `x-cron-secret` header → the equality check fails
→ all cron invocations return 401. **The cron schedule keeps running in the
Vercel dashboard, but no work is performed.** Easy to spot in logs as a
flood of 401s.
