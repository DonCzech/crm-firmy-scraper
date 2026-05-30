import { USER_COOKIE_NAME } from "@/lib/user-auth";

export async function POST() {
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": `${USER_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax` } }
  );
}
