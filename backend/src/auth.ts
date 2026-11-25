import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { env } from "./env.js";

const TOKEN_LIFETIME = "7d";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(userId: string): string {
  return jwt.sign({}, env.JWT_SECRET, { subject: userId, expiresIn: TOKEN_LIFETIME });
}

export function getUserIdFromAuthorization(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    return typeof payload === "object" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function requireUser(userId: string | null): string {
  if (!userId) {
    throw new GraphQLError("Authentication required", { extensions: { code: "UNAUTHENTICATED" } });
  }
  return userId;
}
