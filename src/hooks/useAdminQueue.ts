import { useEffect, useRef, useState } from "react"

import type { QueueEntry, QueueEntryStatus } from "@/components/admin/QueueTable"

export type QueueLoadStatus = "loading" | "ready" | "error"

export type QueueActionResult =
  | { ok: true }
  | { ok: false; reason: "state-changed" | "failed" }

type QueueAction = "start" | "extend" | "end"
type ActionOutcome = "success" | "state-changed" | "failed"

// Mirrors the fields GET /api/queue selects that this hook uses.
interface QueueRecord {
  id: string
  custName: string
  phoneNumber: string | null
  queueNumber: number
  queueStatus: QueueEntryStatus
}

interface LoadResult {
  boothId: string
  status: "ready" | "error"
  entries: QueueEntry[]
}

const QUEUE_ENDPOINT = "/api/queue"
// The API caps a page at 100 rows; the server filters to today's date (Asia/Jakarta) by default.
const QUEUE_PAGE_LIMIT = 100
const QUEUE_POLL_INTERVAL_MS = 5000
const QUEUE_NUMBER_DIGITS = 3
const INVALID_QUEUE_STATE_CODE = "INVALID_QUEUE_STATE"

// Finished rows leave the table, as the ticket says an ended row disappears.
const HIDDEN_STATUSES: readonly QueueEntryStatus[] = ["DONE", "CANCELED"]

const ACTION_PATHS: Record<QueueAction, string> = {
  start: "start-session",
  extend: "extend-session",
  end: "end-session",
}

function formatQueueNumber(queueNumber: number): string {
  return String(queueNumber).padStart(QUEUE_NUMBER_DIGITS, "0")
}

function toEntries(records: QueueRecord[]): QueueEntry[] {
  return records
    .filter((record) => !HIDDEN_STATUSES.includes(record.queueStatus))
    .sort((a, b) => a.queueNumber - b.queueNumber)
    .map((record) => ({
      id: record.id,
      queueNumber: formatQueueNumber(record.queueNumber),
      name: record.custName,
      phoneNumber: record.phoneNumber,
      status: record.queueStatus,
    }))
}

// Resolves to null when the request or the response is unusable.
async function fetchQueueEntries(boothId: string): Promise<QueueEntry[] | null> {
  try {
    const response = await fetch(
      `${QUEUE_ENDPOINT}?idBooth=${encodeURIComponent(boothId)}&limit=${QUEUE_PAGE_LIMIT}`,
      { cache: "no-store" },
    )
    if (!response.ok) return null

    const body: { data?: QueueRecord[] } | null = await response
      .json()
      .catch(() => null)
    return body?.data ? toEntries(body.data) : null
  } catch {
    return null
  }
}

async function sendQueueAction(
  id: string,
  action: QueueAction,
): Promise<ActionOutcome> {
  try {
    const response = await fetch(
      `${QUEUE_ENDPOINT}/${encodeURIComponent(id)}/${ACTION_PATHS[action]}`,
      { method: "PATCH" },
    )
    if (response.ok) return "success"

    const body: { error?: { code?: string } } | null = await response
      .json()
      .catch(() => null)
    // The API answers 400 or 409 with this code when the queue changed under us.
    return body?.error?.code === INVALID_QUEUE_STATE_CODE
      ? "state-changed"
      : "failed"
  } catch {
    return "failed"
  }
}

export function useAdminQueue(
  boothId: string | null,
  onMutated?: () => void,
) {
  const [result, setResult] = useState<LoadResult | null>(null)
  const [reloadCount, setReloadCount] = useState(0)
  const [pendingEntryId, setPendingEntryId] = useState<string | null>(null)
  // A ref, so the polling timer sees the latest value without restarting.
  const isMutatingRef = useRef(false)

  useEffect(() => {
    if (!boothId) return

    let isActive = true

    const load = async () => {
      const entries = await fetchQueueEntries(boothId)
      if (!isActive) return

      if (entries) {
        setResult({ boothId, status: "ready", entries })
        return
      }
      // A failed refresh keeps the last known rows; only the first load shows an error.
      setResult((current) =>
        current?.boothId === boothId && current.status === "ready"
          ? current
          : { boothId, status: "error", entries: [] },
      )
    }

    const poll = () => {
      if (!document.hidden && !isMutatingRef.current) load()
    }

    load()
    const timer = setInterval(poll, QUEUE_POLL_INTERVAL_MS)
    document.addEventListener("visibilitychange", poll)

    return () => {
      isActive = false
      clearInterval(timer)
      document.removeEventListener("visibilitychange", poll)
    }
  }, [boothId, reloadCount])

  const refetch = () => setReloadCount((count) => count + 1)

  const retry = () => {
    setResult(null)
    refetch()
  }

  const runAction = async (
    id: string,
    action: QueueAction,
  ): Promise<QueueActionResult> => {
    isMutatingRef.current = true
    setPendingEntryId(id)
    const outcome = await sendQueueAction(id, action)
    setPendingEntryId(null)
    isMutatingRef.current = false

    if (outcome === "failed") return { ok: false, reason: "failed" }

    refetch()
    onMutated?.()
    return outcome === "success"
      ? { ok: true }
      : { ok: false, reason: "state-changed" }
  }

  // Rows from another booth must not show while the new booth loads.
  const current = result?.boothId === boothId ? result : null

  return {
    entries: current?.entries ?? [],
    loadStatus: current?.status ?? ("loading" as const),
    pendingEntryId,
    retry,
    startSession: (id: string) => runAction(id, "start"),
    extendSession: (id: string) => runAction(id, "extend"),
    endSession: (id: string) => runAction(id, "end"),
  }
}
