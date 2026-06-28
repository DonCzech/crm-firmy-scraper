import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "astera-admin-secret-do-not-use-in-prod";
export const USER_COOKIE_NAME = "webero_user_token";
export const USER_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface UserPayload {
  id: number;
  email: string;
}

export function signUserToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET + "-user", { expiresIn: "30d" });
}

export function verifyUserToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET + "-user") as UserPayload;
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
