import { QrCodeIcon } from "lucide-react"

import { useQueuePageAccent } from "@/app/queue/layout"
import BranchLocationBadge from "@/components/cust/badge/BranchLocationBadge"
import QueueStatusBadge from "@/components/cust/badge/QueueStatusBadge"

export interface QueueStatusViewProps {
  queueNumber: string
  boothName: string
  branch: string
  status: "in_turn" | "done"
}

export default function QueueStatusView({
  queueNumber,
  boothName,
  branch,
  status,
}: QueueStatusViewProps) {
  const isInTurn = status === "in_turn"
  useQueuePageAccent(isInTurn)

  return (
    <div
      role="status"
      className={`-mx-6 -mt-6 -mb-6 flex flex-1 flex-col ${
        isInTurn ? "bg-accent text-background" : "bg-background text-foreground"
      }`}
    >
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-6 py-6">
        <div className="flex justify-center">
          <BranchLocationBadge boothName={boothName} branch={branch} />
        </div>

        {isInTurn && (
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-bold">Waktunya!</h1>
            <p className="text-sm text-background/90">
              Silakan masuk ke {boothName} dan mulai sesi fotomu.
            </p>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl bg-card text-card-foreground shadow-md">
          <div className="flex flex-col items-center px-6 pt-6 pb-3 text-center">
            <p className="text-sm text-muted-foreground">Nomor antreanmu</p>
            <p
              className={`mt-1 text-6xl font-extrabold tabular-nums ${
                isInTurn ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {queueNumber}
            </p>
          </div>
          <div className="relative h-6" aria-hidden>
            <span
              className={`absolute top-0 left-0 size-6 -translate-x-1/2 rounded-full ${
                isInTurn ? "bg-accent" : "bg-background"
              }`}
            />
            <span
              className={`absolute top-0 right-0 size-6 translate-x-1/2 rounded-full ${
                isInTurn ? "bg-accent" : "bg-background"
              }`}
            />
            <div className="absolute inset-x-6 top-1/2 border-t border-dashed" />
          </div>
          <div className="flex flex-col items-center gap-3 px-6 pt-3 pb-6 text-center">
            <QueueStatusBadge status={isInTurn ? "in_turn" : "done"} />
            <p className="font-semibold">
              {isInTurn
                ? `Masuk ke ${boothName} sekarang →`
                : "Terima kasih sudah berfoto!"}
            </p>
          </div>
        </section>

        {!isInTurn && (
          <>
            <p className="text-center text-sm leading-relaxed text-muted-foreground">
              Semoga harimu bikin seru ya. Sampai ketemu lagi di {branch}.
            </p>

            <aside className="mt-auto flex items-center gap-3 rounded-2xl border bg-card p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <QrCodeIcon aria-hidden className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold">Mau foto lagi?</p>
                <p className="text-xs text-muted-foreground">
                  Scan QR di booth untuk antre lagi.
                </p>
              </div>
            </aside>
          </>
        )}
      </main>
    </div>
  )
}