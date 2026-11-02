import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import "dotenv/config";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// BetterAuth (in the Next.js client) signs the tokens and publishes its public keys here
const authUrl = process.env.AUTH_URL || "http://localhost:3000";
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) jwks = createRemoteJWKSet(new URL("/api/auth/jwks", authUrl));
  return jwks;
}

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized: no token provided" });
  }

  try {
    const { payload } = await jwtVerify(header.slice(7), getJwks(), {
      issuer: authUrl,
      audience: authUrl,
    });
    const { sub, email, name } = payload as JWTPayload & { email?: string; name?: string };
    if (!sub || !email) {
      return res.status(401).send({ message: "Unauthorized: invalid token" });
    }
    req.user = { id: sub, email, name };
    next();
  } catch {
    return res.status(401).send({ message: "Unauthorized: invalid or expired token" });
  }
}
