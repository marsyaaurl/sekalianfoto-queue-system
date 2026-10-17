"use client";

import { useState, type FormEvent } from "react";
const MIN_NAME_LENGTH = 3;
interface QueueFormProps {
  onSubmit: (data: { name: string; phone_number?: string }) => void;
  isLoading?: boolean;
}

export default function QueueForm({ onSubmit, isLoading = false }: QueueFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName === "") {
      setError("Nama wajib diisi.");
      return;
    }

    if (trimmedName.length < MIN_NAME_LENGTH) {
      setError("Nama minimal 3 karakter.");
      return;
    }

    setError("");
    onSubmit({
      name: name.trim(),
      phone_number: phone.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">

        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="name" className="mb-2 block font-bold text-foreground">
              Nama
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Nama kamu"
              className={`h-12 w-full rounded-xl border bg-background px-4 outline-none placeholder:text-foreground/40 ${error ? "border-error" : "border-foreground/30 focus:border-accent"
                }`}
            />
            {error && <p className="mt-2 text-error">{error}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block font-bold text-foreground">
              Nomor telepon{" "}
              <span className="font-normal text-foreground/60">(opsional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08×X XXXX XXXX"
              className="h-12 w-full rounded-xl border border-foreground/30 bg-background px-4 outline-none placeholder:text-foreground/40 focus:border-accent"
            />
            <p className="mt-2 text-foreground/70 text-xs">
              Dipakai untuk pengingat giliran. Boleh dikosongkan.
            </p>
          </div>

          <div className="mt-auto pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-accent font-bold text-white shadow-sm transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {isLoading ? "Mengirim..." : "Daftar Antrean"}
            </button>
            <p className="mt-3 text-center text-xs text-foreground/70">
              Satu sesi foto sekitar 5 menit.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
