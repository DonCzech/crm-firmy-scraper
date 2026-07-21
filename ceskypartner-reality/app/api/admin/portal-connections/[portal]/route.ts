import { requireAuth, jsonOk } from "@/lib/apiAuth";
import { inspectPortalConnection } from "@/lib/portal-connectors";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ portal: string }> },
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { portal } = await params;
  return jsonOk(await inspectPortalConnection(portal));
}
