import { BellIcon, BellOffIcon, CircleCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { NotificationPermissionState } from "@/lib/use-notification-permission"

interface NotificationBannerProps {
  permission: NotificationPermissionState
  onEnable: () => void
}

export default function NotificationBanner({
  permission,
  onEnable,
}: NotificationBannerProps) {
  if (permission === "granted") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-success-light p-4 text-success-dark">
        <CircleCheckIcon aria-hidden className="size-5 shrink-0" />
        <div>
          <p className="font-bold">Notifikasi aktif</p>
          <p className="text-sm">Kami kabari saat giliranmu dekat.</p>
        </div>
      </div>
    )
  }

  if (permission === "denied" || permission === "unsupported") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-muted p-4 text-muted-foreground">
        <BellOffIcon aria-hidden className="size-5 shrink-0" />
        <div>
          <p className="font-bold text-foreground">
            {permission === "denied" ? "Notifikasi diblokir" : "Notifikasi tidak tersedia"}
          </p>
          <p className="text-sm">
            {permission === "denied"
              ? "Cukup buka halaman ini, layarnya berubah saat giliranmu tiba."
              : "Buka halaman ini untuk melihat status antreanmu secara langsung."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-accent/10 p-4">
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-2 text-lg font-bold text-foreground">
          <BellIcon aria-hidden className="size-5 text-accent" />
          Mau dikabari?
        </p>
        <p className="text-muted-foreground">
          Aktifkan notifikasi agar kamu tahu saat giliranmu dekat.
        </p>
      </div>
      <Button
        type="button"
        className="h-11 shrink-0 rounded-full px-5 font-bold"
        onClick={onEnable}
      >
        Aktifkan
      </Button>
    </div>
  )
}
