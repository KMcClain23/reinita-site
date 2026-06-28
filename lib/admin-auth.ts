/**
 * Admin auth helpers.
 *
 * The login API verifies the password against ADMIN_PASSWORD and sets a
 * cookie whose value is HMAC-SHA256(SALT) keyed by the password — so the
 * raw password is never stored client-side, even in an HTTP-only cookie.
 * Middleware re-computes the HMAC against the configured password and
 * compares with the cookie value.
 *
 * Uses Web Crypto (not Node's crypto) so the same code runs in both the
 * Node API route runtime and the Edge middleware runtime.
 */

const SALT = "rl-admin-v1";

export async function computeAdminToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(SALT));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const ADMIN_COOKIE = "rl_admin";
