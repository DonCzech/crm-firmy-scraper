// Legacy content API — replaced by /api/demo/[tenantSlug]/sections in venom SaaS
export async function GET() {
  return Response.json({ error: "Use /api/demo/[tenantSlug]/sections" }, { status: 410 });
}

export async function PUT() {
  return Response.json({ error: "Use /api/demo/[tenantSlug]/sections" }, { status: 410 });
}
