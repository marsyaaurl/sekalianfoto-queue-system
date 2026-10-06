"use client";

import { useState, type FormEvent } from "react";

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

    if (name.trim() === "") {
      setError("Nama wajib diisi.");
      return;
    }

    setError("");
    onSubmit({
      name: name.trim(),
      phone_number: phone.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
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
            className={`h-12 w-full rounded-lg border bg-white px-4 outline-none placeholder:text-foreground/40 ${
              error ? "border-error" : "border-foreground/30 focus:border-accent"
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
            className="h-12 w-full rounded-lg border border-foreground/30 bg-white px-4 outline-none placeholder:text-foreground/40 focus:border-accent"
          />
          <p className="mt-2 text-foreground/70">
            Dipakai untuk pengingat giliran. Boleh dikosongkan.
          </p>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-lg bg-accent font-bold text-white disabled:opacity-50"
        >
          {isLoading ? "Mengirim..." : "Daftar Antrean"}
        </button>
        <p className="mt-3 text-center text-sm text-foreground/70">
          Satu sesi foto sekitar 5 menit.
        </p>
      </div>
    </form>
  );
}