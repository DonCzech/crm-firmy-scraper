import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "astera-admin-secret-do-not-use-in-prod";
export const COOKIE_NAME = "astera_admin_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface AdminPayload {
  id: number;
  email: string;
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export function cookieOptions(maxAge: number) {
  return [
    `${COOKIE_NAME}=${maxAge > 0 ? "" : ""}`,
    `HttpOnly`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    `SameSite=Lax`,
  ].join("; ");
}
