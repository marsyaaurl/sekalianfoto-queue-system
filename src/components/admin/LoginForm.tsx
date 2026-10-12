"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: identifier.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Display exact design error message on failure
        setError(
          data.error?.message ||
          "Email/username atau password salah. Periksa lagi, lalu coba masuk kembali."
        );
        return;
      }

      // Redirect to admin booth dashboard
      router.push("/admin/queue");
      router.refresh();
    } catch {
      setError(
        "Email/username atau password salah. Periksa lagi, lalu coba masuk kembali."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] rounded-2xl bg-card p-8 md:p-10 shadow-xl border border-border/40">
      <h1 className="text-2xl md:text-[28px] font-bold text-foreground mb-6">
        Masuk sebagai staf
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="identifier"
            className="block text-sm font-semibold text-foreground"
          >
            Email atau username
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Staf A"
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-md border border-error bg-error-light p-3 text-xs md:text-sm text-error leading-relaxed"
          >
            Email/username atau password salah.
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-lg bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? "Memuat..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
