import { Button } from "@/components/ui/button"

interface NotificationBannerProps {
  onEnable: () => void
}

export default function NotificationBanner({
  onEnable,
}: NotificationBannerProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-warning-dark/40 bg-warning-light p-4">
      <p className="text-foreground">
        Aktifkan notifikasi agar kamu tahu saat giliranmu dekat.
      </p>
      <Button
        type="button"
        variant="ghost"
        className="font-bold text-accent"
        onClick={onEnable}
      >
        Aktifkan
      </Button>
    </div>
  )
}