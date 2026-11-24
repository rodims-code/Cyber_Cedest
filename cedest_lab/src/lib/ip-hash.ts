import { createHmac } from "node:crypto";
import { headers } from "next/headers";

/**
 * Calcule l'empreinte HMAC-SHA256 de l'IP avec BETTER_AUTH_SECRET.
 * Ne stocke et ne renvoie JAMAIS l'IP brute.
 */
export async function getClientIpHmac(): Promise<string> {
  const reqHeaders = await headers();
  const forwarded = reqHeaders.get("x-forwarded-for");
  const rawIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

  const secret = process.env.BETTER_AUTH_SECRET || "default_fallback_secret_cedest";
  return createHmac("sha256", secret).update(rawIp).digest("hex");
}
