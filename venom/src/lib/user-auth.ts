import jwt from "jsonwebtoken";

function userJwtSecret(): string {
  const secret = process.env.USER_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("USER_JWT_SECRET or JWT_SECRET is required");
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("User JWT secret must contain at least 32 characters in production");
  }
  return `${secret}:user`;
}
export const USER_COOKIE_NAME = "webero_user_token";
export const USER_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface UserPayload {
  id: number;
  email: string;
}

export function signUserToken(payload: UserPayload): string {
  return jwt.sign(payload, userJwtSecret(), { expiresIn: "30d", algorithm: "HS256", issuer: "webero", audience: "webero-user" });
}

export function verifyUserToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, userJwtSecret(), { algorithms: ["HS256"], issuer: "webero", audience: "webero-user" }) as UserPayload;
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: Request): UserPayload | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${USER_COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyUserToken(match[1]);
}
