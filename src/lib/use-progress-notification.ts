import { useEffect, useRef } from "react"

import { showBrowserNotification } from "@/lib/browser-notification"
import type { QueueStatusValue } from "@/lib/queue-api"

const NOTIFICATION_TITLE = "Sekalian Foto"

// Fewer people ahead means the customer is told about every step.
const FAR_THRESHOLD = 10
const NEAR_THRESHOLD = 5
const FAR_STEP = 5
const MIDDLE_STEP = 2
const NEAR_STEP = 1

// The turn notification covers the moment nobody is left ahead.
const MIN_NOTIFIED_PEOPLE_AHEAD = 1

export function getProgressStep(peopleAhead: number): number {
  if (peopleAhead > FAR_THRESHOLD) return FAR_STEP
  if (peopleAhead > NEAR_THRESHOLD) return MIDDLE_STEP
  return NEAR_STEP
}

export function shouldNotifyProgress(
  baselinePeopleAhead: number,
  peopleAhead: number,
): boolean {
  if (peopleAhead < MIN_NOTIFIED_PEOPLE_AHEAD) return false
  return baselinePeopleAhead - peopleAhead >= getProgressStep(peopleAhead)
}

// Sends a browser notification when enough people ahead of the customer have left.
export function useProgressNotification(
  peopleAhead: number | undefined,
  status: QueueStatusValue | undefined,
) {
  // The number of people ahead at the last notification, or at the first reading.
  const baselinePeopleAhead = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (status !== "WAITING" || peopleAhead === undefined) return

    const baseline = baselinePeopleAhead.current
    if (baseline === undefined || peopleAhead > baseline) {
      baselinePeopleAhead.current = peopleAhead
      return
    }

    if (!shouldNotifyProgress(baseline, peopleAhead)) return

    baselinePeopleAhead.current = peopleAhead
    showBrowserNotification(
      NOTIFICATION_TITLE,
      `Antreanmu maju. Tinggal ${peopleAhead} orang lagi di depanmu.`,
    )
  }, [peopleAhead, status])
}
