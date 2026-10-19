"use client"

import { useState, type ReactNode } from "react"

import { BoothFilter } from "@/components/admin/BoothFilter"
import { EndSessionDialog } from "@/components/admin/EndSessionDialog"
import { QueueTable, type QueueEntry } from "@/components/admin/QueueTable"
import { Button } from "@/components/ui/button"
import {
  useAdminQueue,
  type QueueActionResult,
  type QueueLoadStatus,
} from "@/hooks/useAdminQueue"
import { useBooths, type BoothLoadStatus, type ManagedBooth } from "@/hooks/useBooths"
import { cn } from "@/lib/utils"

type NoticeTone = "info" | "error"

interface Notice {
  tone: NoticeTone
  message: string
}

const SKELETON_ROW_COUNT = 5

const NO_BOOTH_MESSAGE = "Belum ada booth"
const QUEUE_LOAD_ERROR_MESSAGE = "Gagal memuat antrean."
const STATE_CHANGED_MESSAGE = "Status antrean sudah berubah. Data diperbarui."
const GENERIC_ERROR_MESSAGE = "Terjadi kesalahan. Coba lagi."

const NOTICE_STYLES: Record<NoticeTone, string> = {
  info: "bg-muted text-foreground",
  error: "border-destructive/50 bg-destructive/10 text-destructive",
}

// Falls back to the first booth, so a missing selection never leaves the table blank.
function resolveSelectedBoothId(
  booths: ManagedBooth[],
  selectedBoothId: string | null,
): string | null {
  const isStillListed = booths.some((booth) => booth.id === selectedBoothId)
  return isStillListed ? selectedBoothId : (booths[0]?.id ?? null)
}

// The backend promotes the earliest waiting entry when a session ends.
function findNextWaitingNumber(entries: QueueEntry[]): string | null {
  return entries.find((entry) => entry.status === "WAITING")?.queueNumber ?? null
}

interface NoticeBannerProps {
  notice: Notice
  onDismiss: () => void
}

function NoticeBanner({ notice, onDismiss }: NoticeBannerProps) {
  return (
    <div
      role={notice.tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border px-4 py-3",
        NOTICE_STYLES[notice.tone],
      )}
    >
      <p>{notice.message}</p>
      <Button variant="ghost" size="sm" onClick={onDismiss}>
        Tutup
      </Button>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div role="status" className="overflow-hidden rounded-xl border">
      <span className="sr-only">Memuat antrean...</span>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse border-b bg-muted/50 last:border-b-0"
        />
      ))}
    </div>
  )
}

interface LoadErrorProps {
  message: string
  onRetry: () => void
}

function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border p-6"
    >
      <p className="text-destructive">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Coba lagi
      </Button>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border p-6 text-center text-muted-foreground">
      {message}
    </div>
  )
}

interface QueueBodyProps {
  boothStatus: BoothLoadStatus
  boothError: string
  hasBooths: boolean
  queueStatus: QueueLoadStatus
  onRetryBooths: () => void
  onRetryQueue: () => void
  table: ReactNode
}

function QueueBody({
  boothStatus,
  boothError,
  hasBooths,
  queueStatus,
  onRetryBooths,
  onRetryQueue,
  table,
}: QueueBodyProps) {
  if (boothStatus === "loading") return <TableSkeleton />
  if (boothStatus === "error") {
    return <LoadError message={boothError} onRetry={onRetryBooths} />
  }
  if (!hasBooths) return <EmptyState message={NO_BOOTH_MESSAGE} />
  if (queueStatus === "loading") return <TableSkeleton />
  if (queueStatus === "error") {
    return <LoadError message={QUEUE_LOAD_ERROR_MESSAGE} onRetry={onRetryQueue} />
  }
  return table
}

// Self-contained, so it can move to its own route later.
function QueueMonitoringSection() {
  const {
    booths,
    loadStatus: boothStatus,
    loadError: boothError,
    refetch: refetchBooths,
    retry: retryBooths,
  } = useBooths()
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null)
  const [endTargetId, setEndTargetId] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  const activeBoothId = resolveSelectedBoothId(booths, selectedBoothId)
  const queue = useAdminQueue(activeBoothId, refetchBooths)

  const endTarget = queue.entries.find((entry) => entry.id === endTargetId)

  const showResult = (result: QueueActionResult) => {
    if (result.ok) return
    if (result.reason === "state-changed") {
      setEndTargetId(null)
      setNotice({ tone: "info", message: STATE_CHANGED_MESSAGE })
      return
    }
    setNotice({ tone: "error", message: GENERIC_ERROR_MESSAGE })
  }

  const runAction = async (
    action: (id: string) => Promise<QueueActionResult>,
    id: string,
  ) => {
    setNotice(null)
    showResult(await action(id))
  }

  // The dialog has no submitting state, so it closes first to block a second click.
  const handleConfirmEnd = () => {
    if (endTargetId === null) return
    setEndTargetId(null)
    runAction(queue.endSession, endTargetId)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Antrean</h1>

      {boothStatus === "ready" && booths.length > 0 && (
        <BoothFilter
          booths={booths}
          selectedBoothId={activeBoothId}
          onSelect={setSelectedBoothId}
        />
      )}

      {notice && (
        <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />
      )}

      <QueueBody
        boothStatus={boothStatus}
        boothError={boothError}
        hasBooths={booths.length > 0}
        queueStatus={queue.loadStatus}
        onRetryBooths={retryBooths}
        onRetryQueue={queue.retry}
        table={
          <QueueTable
            entries={queue.entries}
            pendingEntryId={queue.pendingEntryId}
            onStartSession={(id) => runAction(queue.startSession, id)}
            onExtendSession={(id) => runAction(queue.extendSession, id)}
            onEndSession={setEndTargetId}
          />
        }
      />

      <EndSessionDialog
        open={endTarget !== undefined}
        onOpenChange={(open) => {
          if (!open) setEndTargetId(null)
        }}
        queueNumber={endTarget?.queueNumber ?? ""}
        nextQueueNumber={findNextWaitingNumber(queue.entries)}
        onConfirm={handleConfirmEnd}
      />
    </div>
  )
}

export default function AdminQueuePage() {
  return <QueueMonitoringSection />
}
