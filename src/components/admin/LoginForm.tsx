"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface LoginFieldErrors {
  identifier?: string;
  password?: string;
}

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const nextFieldErrors: LoginFieldErrors = {};
    if (!identifier.trim()) nextFieldErrors.identifier = "Email wajib diisi.";
    if (!password.trim()) nextFieldErrors.password = "Password wajib diisi.";

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

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
        Login Admin
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="identifier"
            className="block text-sm font-semibold text-foreground"
          >
            Email
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            autoComplete="username"
            value={identifier}
            aria-invalid={Boolean(fieldErrors.identifier)}
            aria-describedby={
              fieldErrors.identifier ? "identifier-error" : undefined
            }
            onChange={(e) => {
              setIdentifier(e.target.value);
              setFieldErrors((current) => ({ ...current, identifier: undefined }));
              setError(null);
            }}
            placeholder="Staf A"
            className={`w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 transition-colors ${
              fieldErrors.identifier
                ? "border-error focus:border-error focus:ring-error"
                : "border-border focus:border-accent focus:ring-accent"
            }`}
          />
          {fieldErrors.identifier && (
            <p id="identifier-error" className="text-sm text-error">
              {fieldErrors.identifier}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? "password-error" : undefined
              }
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((current) => ({ ...current, password: undefined }));
                setError(null);
              }}
              placeholder="••••••••"
              className={`w-full rounded-lg border bg-card px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 transition-colors ${
                fieldErrors.password
                  ? "border-error focus:border-error focus:ring-error"
                  : "border-border focus:border-accent focus:ring-accent"
              }`}
            />
            <button
              type="button"
              aria-label={isPasswordVisible ? "Sembunyikan password" : "Tampilkan password"}
              aria-pressed={isPasswordVisible}
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {isPasswordVisible ? (
                <EyeOffIcon aria-hidden className="size-5" />
              ) : (
                <EyeIcon aria-hidden className="size-5" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p id="password-error" className="text-sm text-error">
              {fieldErrors.password}
            </p>
          )}
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
