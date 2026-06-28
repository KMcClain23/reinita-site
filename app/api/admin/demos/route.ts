import { NextResponse, type NextRequest } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createServiceRoleClient } from "@/lib/supabase";
import { createR2Client, R2_BUCKET } from "@/lib/r2";

const EDITABLE_FIELDS = [
  "title",
  "genre",
  "character",
  "description",
  "audio_url",
  "r2_key",
  "duration_seconds",
  "sort_order",
  "published",
] as const;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { title, genre, audio_url } = body as Record<string, string>;
  if (!title || !genre || !audio_url) {
    return NextResponse.json(
      { error: "title, genre, and audio_url are required" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const insert: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) insert[field] = body[field];
  }

  const { data, error } = await supabase
    .from("demos")
    .insert(insert)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ demo: data });
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const id = body.id;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) update[field] = body[field];
  }
  update.updated_at = new Date().toISOString();

  const supabase = createServiceRoleClient();

  // If r2_key is being changed, capture the OLD key first so we can
  // clean up the orphaned audio file from R2 after the DB update.
  let oldR2Key: string | null = null;
  if (
    "r2_key" in update &&
    typeof update.r2_key === "string" &&
    update.r2_key
  ) {
    const { data: current } = await supabase
      .from("demos")
      .select("r2_key")
      .eq("id", id)
      .single();
    if (current?.r2_key && current.r2_key !== update.r2_key) {
      oldR2Key = current.r2_key;
    }
  }

  const { data, error } = await supabase
    .from("demos")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Best-effort cleanup of the replaced audio file. Don't fail the
  // request if R2 delete errors — the metadata update already
  // succeeded and a stray file in R2 is recoverable.
  if (oldR2Key) {
    try {
      const client = createR2Client();
      await client.send(
        new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: oldR2Key })
      );
    } catch (err) {
      console.error("R2 cleanup on edit failed (non-fatal):", err);
    }
  }

  return NextResponse.json({ demo: data });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Look up r2_key first so we can clean up the audio file too
  const { data: demo } = await supabase
    .from("demos")
    .select("r2_key")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("demos").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Best-effort R2 cleanup — don't fail the request if the file's already gone
  if (demo?.r2_key) {
    try {
      const client = createR2Client();
      await client.send(
        new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: demo.r2_key })
      );
    } catch (err) {
      console.error("R2 delete failed (non-fatal):", err);
    }
  }

  return NextResponse.json({ ok: true });
}
