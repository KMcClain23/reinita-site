import { S3Client } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 is S3-compatible.
 *
 * Two R2 gotchas to remember:
 *  1. Presigned PUTs must NOT include Content-Type in signed headers — only host.
 *     When signing, pass `unhoistableHeaders: new Set(['content-type'])` or sign
 *     without Content-Type at all, then send it as a normal header at PUT time.
 *  2. Disable CRC32 checksums; they're incompatible with R2.
 */
export function createR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
}

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "reinita-demos";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

/**
 * Resolve a key (e.g. "demos/sample-1.mp3") to its public URL.
 */
export function publicUrlForKey(key: string) {
  if (!R2_PUBLIC_URL) return "";
  return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
}
