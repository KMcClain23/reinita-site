import { NextResponse } from "next/server";
import { z } from "zod";
import { getResend, RESEND_FROM, CONTACT_INBOX } from "@/lib/resend";
import { createServiceRoleClient } from "@/lib/supabase";

const InquirySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  project_type: z.string().min(1).max(120),
  genre: z.string().max(120).optional().default(""),
  deadline: z.string().max(120).optional().default(""),
  message: z.string().min(1).max(5000),
  // Honeypot — must be empty
  company: z.string().max(0).optional().default(""),
});

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = InquirySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fill in name, email, project type, and message." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Honeypot filled → silently succeed (don't tell bots)
  if (data.company) {
    return NextResponse.json({ ok: true });
  }

  // Persist for future status board / record-keeping
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("inquiries").insert({
      name: data.name,
      email: data.email,
      project_type: data.project_type,
      genre: data.genre || null,
      deadline: data.deadline || null,
      message: data.message,
      source: "contact_form",
    });
  } catch (err) {
    // Persistence failure shouldn't block the email — just log
    console.error("Inquiry persist failed:", err);
  }

  // Send the email
  try {
    const resend = getResend();
    const html = `
      <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;color:#0a1f2e;max-width:560px">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#1a4d5c;">New inquiry</p>
        <h2 style="font-size:22px;margin:6px 0 24px;">${escape(data.name)}</h2>
        <table style="border-collapse:collapse;font-size:14px;line-height:1.5">
          <tr><td style="padding:4px 12px 4px 0;color:#8a8273">Email</td><td><a href="mailto:${escape(data.email)}">${escape(data.email)}</a></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#8a8273">Project</td><td>${escape(data.project_type)}</td></tr>
          ${data.genre ? `<tr><td style="padding:4px 12px 4px 0;color:#8a8273">Genre</td><td>${escape(data.genre)}</td></tr>` : ""}
          ${data.deadline ? `<tr><td style="padding:4px 12px 4px 0;color:#8a8273">Deadline</td><td>${escape(data.deadline)}</td></tr>` : ""}
        </table>
        <hr style="border:none;border-top:1px solid #d4e4dc;margin:24px 0">
        <p style="white-space:pre-wrap;font-size:15px;line-height:1.6">${escape(data.message)}</p>
      </div>
    `;

    await resend.emails.send({
      from: RESEND_FROM,
      to: CONTACT_INBOX,
      replyTo: data.email,
      subject: `New inquiry from ${data.name} — ${data.project_type}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend send failed:", err);
    return NextResponse.json(
      { error: "Couldn't send the email — please try emailing directly." },
      { status: 500 }
    );
  }
}
