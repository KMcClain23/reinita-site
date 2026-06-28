"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/admin/demos";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }
      router.push(from);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Try again");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <p className="eyebrow mb-4">Sign in</p>
      <h1 className="font-display-italic text-4xl text-abyss mb-10">
        Welcome back.
      </h1>
      <label htmlFor="password" className="eyebrow block mb-2">
        Password
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoFocus
        className="w-full bg-transparent border-b border-abyss/30 focus:border-kelp outline-none py-3 text-base text-abyss transition-colors"
      />
      {error && (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || password.length === 0}
        className="lift-btn mt-8 bg-abyss text-shore px-8 py-3.5 text-sm font-medium tracking-wide rounded-full hover:bg-tide disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in →"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
