import { useState } from "react"

export type NotificationPermissionState = NotificationPermission | "unsupported"

function readPermission(): NotificationPermissionState {
  return typeof Notification === "undefined"
    ? "unsupported"
    : Notification.permission
}

// Tracks the browser's notification permission and lets the page ask for it.
export function useNotificationPermission() {
  const [permission, setPermission] =
    useState<NotificationPermissionState>(readPermission)

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return
    setPermission(await Notification.requestPermission())
  }

  return { permission, requestPermission }
}