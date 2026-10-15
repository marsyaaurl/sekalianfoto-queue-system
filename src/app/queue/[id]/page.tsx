"use client"

import { use, useEffect, useState } from "react"

import BranchLocationBadge from "@/components/cust/badge/BranchLocationBadge"
import QueueStatusBadge, {
  type QueueStatus,
} from "@/components/cust/badge/QueueStatusBadge"
import NotificationBanner from "@/components/cust/NotificationBanner"
import QueueCard from "@/components/cust/QueueCard"
import YourTurnView from "@/components/cust/YourTurnView"
import {
  ApiRequestError,
  getQueue,
  type QueueDetail,
  type QueueStatusValue,
} from "@/lib/queue-api"
import { useNotificationPermission } from "@/lib/use-notification-permission"
import { useTurnNotification } from "@/lib/use-turn-notification"

const POLL_INTERVAL_MS = 5000
const QUEUE_NUMBER_DIGITS = 3
const LOADING_MESSAGE = "Memuat antreanmu..."
const LOAD_ERROR_MESSAGE = "Terjadi kesalahan. Coba lagi sebentar lagi."
const AUTO_REFRESH_NOTE =
  "Halaman ini diperbarui otomatis. Kembali ke booth saat estimasi tinggal sekitar 5 menit."

// The API sends upper-case statuses; the badge component uses lower-case keys.
const BADGE_STATUS: Record<QueueStatusValue, QueueStatus> = {
  WAITING: "waiting",
  IN_TURN: "in_turn",
  DONE: "done",
  EXTENDED: "extended",
  CANCELED: "canceled",
}

interface QueueStatusPageProps {
  params: Promise<{ id: string }>
}

function formatQueueNumber(boothCode: string | undefined, queueNumber: number) {
  const digits = String(queueNumber).padStart(QUEUE_NUMBER_DIGITS, "0")
  return `${boothCode ?? ""}${digits}`
}

// Loads the queue once, then refreshes it on a timer.
function useQueueDetail(publicToken: string) {
  const [queue, setQueue] = useState<QueueDetail | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isActive = true

    const load = async () => {
      try {
        const detail = await getQueue(publicToken)
        if (!isActive) return
        setQueue(detail)
        setErrorMessage("")
      } catch (error) {
        if (!isActive) return
        setErrorMessage(
          error instanceof ApiRequestError ? error.message : LOAD_ERROR_MESSAGE,
        )
      }
    }

    load()
    const timer = setInterval(load, POLL_INTERVAL_MS)

    return () => {
      isActive = false
      clearInterval(timer)
    }
  }, [publicToken])

  return { queue, errorMessage }
}

export default function QueueStatusPage({ params }: QueueStatusPageProps) {
  const { id } = use(params)
  const { queue, errorMessage } = useQueueDetail(id)
  const { permission, requestPermission } = useNotificationPermission()
    useTurnNotification(queue?.queueStatus, queue?.booth.name, permission)

  // A failed refresh keeps showing the last known queue; only the first load shows an error.
  if (!queue) {
    return errorMessage ? (
      <p role="alert" className="text-error">
        {errorMessage}
      </p>
    ) : (
      <p className="text-foreground/70">{LOADING_MESSAGE}</p>
    )
  }

  const queueNumber = formatQueueNumber(queue.boothCode, queue.queueNumber)

  if (queue.queueStatus === "IN_TURN") {
    return <YourTurnView queueNumber={queueNumber} boothName={queue.booth.name} />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BranchLocationBadge
          boothName={queue.booth.name}
          branch={queue.booth.branch}
        />
      </div>

      <QueueCard
        queueNumber={queueNumber}
        peopleAhead={queue.peopleAhead}
        estimatedMinutes={queue.estimatedWaitMinutes}
        badge={<QueueStatusBadge status={BADGE_STATUS[queue.queueStatus]} />}
      />

      {permission === "default" && (
        <NotificationBanner onEnable={requestPermission} />
      )}

      <p className="text-foreground/70">{AUTO_REFRESH_NOTE}</p>
    </div>
  )
}