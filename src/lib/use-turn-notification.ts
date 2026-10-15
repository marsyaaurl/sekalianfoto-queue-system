import { useEffect, useRef } from "react"

import type { QueueStatusValue } from "@/lib/queue-api"
import type { NotificationPermissionState } from "@/lib/use-notification-permission"

const NOTIFICATION_TITLE = "Sekalian Foto"

// Sends one browser notification when the queue changes to "your turn".
export function useTurnNotification(
  status: QueueStatusValue | undefined,
  boothName: string | undefined,
  permission: NotificationPermissionState,
) {
  const previousStatus = useRef<QueueStatusValue | undefined>(undefined)

  useEffect(() => {
    const previous = previousStatus.current
    previousStatus.current = status

    const justBecameYourTurn =
      previous !== undefined && previous !== "IN_TURN" && status === "IN_TURN"

    if (!justBecameYourTurn || permission !== "granted") return

    try {
      new Notification(NOTIFICATION_TITLE, {
        body: `Giliranmu sudah tiba. Silakan masuk ke ${boothName}.`,
      })
    } catch {
      // Some mobile browsers only allow notifications through a service worker.
    }
  }, [status, boothName, permission])
}