import jwt from "jsonwebtoken";

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters in production");
  }
  return secret;
}
export const COOKIE_NAME = "webero_admin_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface AdminPayload {
  id: number;
  email: string;
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: "7d", algorithm: "HS256", issuer: "webero", audience: "webero-admin" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, jwtSecret(), { algorithms: ["HS256"], issuer: "webero", audience: "webero-admin" }) as AdminPayload;
  } catch {
    return null;
  }
}

export function serializeAuthCookie(name: string, value: string, maxAge: number, path = "/"): string {
  return [
    `${name}=${value}`,
    "HttpOnly",
    `Path=${path}`,
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ].join("; ");
}
