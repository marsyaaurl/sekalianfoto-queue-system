import React from "react";
import Image from "next/image";
import { LoginForm } from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full relative flex items-center justify-center p-6 md:p-12 overflow-hidden bg-gradient-to-br from-[#D26E47] via-[#89381A] to-[#160E0C]">
      {/* Soft ambient lighting top-left matching the Figma design */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-white/20 blur-[130px]"
      />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left column: Brand Logo & Mascot */}
        <div className="flex flex-col items-center justify-center text-center select-none">
          <div className="relative w-[280px] sm:w-[360px] md:w-[440px] aspect-[440/140]">
            <Image
              src="/logo.png"
              alt="Sekalian Foto"
              fill
              priority
              className="object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* Right column: Login Form Card */}
        <div className="flex items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
