import { USER_COOKIE_NAME } from "@/lib/user-auth";
import { serializeAuthCookie } from "@/lib/auth";

export async function POST() {
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": serializeAuthCookie(USER_COOKIE_NAME, "", 0) } }
  );
}
