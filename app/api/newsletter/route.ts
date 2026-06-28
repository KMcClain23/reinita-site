import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase";

const SignupSchema = z.object({
  email: z.string().email().max(320),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = SignupSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "That doesn't look like a valid email." },
      { status: 400 }
    );
  }
  const { email } = parsed.data;

  // Store in Supabase (source of truth — survives if we change providers)
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email, status: "pending", source: "site" },
        { onConflict: "email" }
      );
    if (error) {
      console.error("Newsletter upsert error:", error);
    }
  } catch (err) {
    console.error("Newsletter store failed:", err);
  }

  // Optionally sync to Buttondown
  if (process.env.BUTTONDOWN_API_KEY) {
    try {
      const res = await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_address: email }),
      });
      if (!res.ok && res.status !== 400) {
        // 400 typically = already subscribed, treat as success
        const txt = await res.text();
        console.error("Buttondown error:", res.status, txt);
      }
    } catch (err) {
      console.error("Buttondown sync failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
