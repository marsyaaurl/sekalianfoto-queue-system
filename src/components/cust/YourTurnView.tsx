import Image from "next/image"

import QueueStatusBadge from "@/components/cust/badge/QueueStatusBadge"

interface YourTurnViewProps {
  queueNumber: string
  boothName: string
}

export default function YourTurnView({
  queueNumber,
  boothName,
}: YourTurnViewProps) {
  return (
    <div
      role="status"
      className="fixed inset-0 z-50 overflow-y-auto bg-foreground text-background"
    >
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col gap-8 px-6 pb-6">
        <Image
          src="/logo.png"
          alt="Sekalian Foto"
          width={160}
          height={40}
          className="-ml-3 -translate-y-3 h-18 w-auto self-start"
        />

            <div className="mt-8 flex flex-col gap-4">
            <h1 className="text-center text-5xl font-bold text-accent">Waktunya!</h1>
            <p className="text-2xl">
            Silakan masuk ke {boothName} dan mulai sesi fotomu.
          </p>
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-background/30 bg-background/10 px-6 py-8 text-center">
          <p className="text-background/70">Nomor antreanmu</p>
          <p className="my-3 text-6xl font-bold">{queueNumber}</p>
          <QueueStatusBadge status="in_turn" />
        </div>

        <p className="text-background/70">
          Butuh waktu lebih lama? Tanyakan ke staf di lokasi.
        </p>
      </div>
    </div>
  )
}