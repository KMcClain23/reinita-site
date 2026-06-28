import { NextResponse, type NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createR2Client, R2_BUCKET, publicUrlForKey } from "@/lib/r2";

/**
 * Returns a presigned URL the browser can PUT the audio file to directly,
 * along with the R2 key and resulting public URL.
 *
 * Per lib/r2.ts notes, we don't include ContentType on the PutObjectCommand
 * — R2 stores whatever Content-Type header the browser sends with the PUT.
 * This avoids the SigV4 / R2 content-type signing incompatibility.
 */
export async function POST(req: NextRequest) {
  let filename = "";
  let contentType = "";
  try {
    const body = await req.json();
    filename = String(body.filename ?? "");
    contentType = String(body.contentType ?? "");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: "filename and contentType are required" },
      { status: 400 }
    );
  }
  if (!contentType.startsWith("audio/")) {
    return NextResponse.json(
      { error: "Only audio files allowed" },
      { status: 400 }
    );
  }

  const safeName = filename.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  const stamp = Date.now();
  const key = `demos/${stamp}-${safeName}`;

  const client = createR2Client();
  const command = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });

  return NextResponse.json({
    uploadUrl,
    key,
    publicUrl: publicUrlForKey(key),
  });
}
