import { BellIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface NotificationBannerProps {
  onEnable: () => void
}

export default function NotificationBanner({
  onEnable,
}: NotificationBannerProps) {
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
