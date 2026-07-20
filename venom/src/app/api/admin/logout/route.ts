import { NextRequest } from "next/server";
import { COOKIE_NAME, serializeAuthCookie } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/demo-auth";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": serializeAuthCookie(COOKIE_NAME, "", 0),
      },
    }
  );
}
