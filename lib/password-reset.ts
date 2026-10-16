import { createHash, randomBytes } from "crypto";
import { absoluteUrl } from "./site-url";

export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

export function createRawResetToken() {
  return randomBytes(32).toString("hex");
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Absolute reset link under the app's basePath. Uses `absoluteUrl` because
 * AUTH_URL / NEXTAUTH_URL end in `/api/auth`, which must not prefix the page.
 */
export function buildPasswordResetUrl(rawToken: string) {
  return absoluteUrl(`/reset-password?token=${encodeURIComponent(rawToken)}`);
}
