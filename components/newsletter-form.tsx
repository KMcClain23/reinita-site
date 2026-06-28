"use client";

import { useState } from "react";

interface NewsletterFormProps {
  variant?: "light" | "dark";
}

export function NewsletterForm({ variant = "light" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went sideways.");
      setStatus("ok");
      setMessage("You're in. Watch your inbox.");
      setEmail("");
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Try again in a minute.");
    }
  };

  const isDark = variant === "dark";

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <label
        htmlFor="newsletter-email"
        className={`block eyebrow mb-3 ${isDark ? "text-mist" : ""}`}
      >
        Be the first to hear
      </label>
      <div
        className={`flex items-center border-b ${
          isDark ? "border-mist/30" : "border-abyss/40"
        } focus-within:border-kelp transition-colors pb-2`}
      >
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@somewhere.com"
          className={`flex-1 bg-transparent outline-none text-base placeholder:text-driftwood/60 ${
            isDark ? "text-shore" : "text-abyss"
          }`}
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`ml-3 text-sm font-medium tracking-wide transition-colors ${
            isDark
              ? "text-mist hover:text-shore"
              : "text-tide hover:text-abyss"
          } disabled:opacity-50`}
        >
          {status === "loading" ? "Sending…" : "Subscribe →"}
        </button>
      </div>
      {message && (
        <p
          className={`mt-3 text-sm ${
            status === "ok"
              ? isDark
                ? "text-mist"
                : "text-kelp"
              : "text-red-700"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
