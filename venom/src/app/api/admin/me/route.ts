import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { adminExists } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const setupRequired = !(await adminExists());

  if (!token) {
    return Response.json({ admin: false, setupRequired });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return Response.json({ admin: false, setupRequired });
  }
  return Response.json({ admin: true, email: payload.email });
}
