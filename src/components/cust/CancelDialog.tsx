"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface CancelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  queueNumber: string
  onConfirm: () => void
  isLoading?: boolean
}

export default function CancelDialog({
  open,
  onOpenChange,
  queueNumber,
  onConfirm,
  isLoading = false,
}: CancelDialogProps) {
  // Keep the dialog open while the cancel request is running.
  const handleOpenChange = (nextOpen: boolean) => {
    if (!isLoading) onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-auto bottom-4 translate-y-0"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Batalkan antrean?
          </DialogTitle>
          <DialogDescription className="text-base">
            Nomor {queueNumber} akan dihapus dan orang di belakangmu maju satu
            posisi. Kamu perlu daftar ulang kalau ingin antre lagi.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:flex-col-reverse">
          <DialogClose
            render={
              <Button
                variant="outline"
                className="h-12 w-full text-base font-bold"
                disabled={isLoading}
              />
            }
          >
            Tetap Antre
          </DialogClose>
          <Button
            className="h-12 w-full bg-error text-base font-bold text-white hover:bg-error-normal-hover"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Membatalkan..." : "Ya, batalkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}