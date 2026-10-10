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

export interface EndSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  queueNumber: string
  nextQueueNumber: string | null
  onConfirm: () => void
}

function buildNextTurnSentence(nextQueueNumber: string | null): string {
  if (nextQueueNumber === null) {
    return "Tidak ada antrean berikutnya."
  }
  return `Giliran berikutnya, ${nextQueueNumber}, langsung dipanggil.`
}

export function EndSessionDialog({
  open,
  onOpenChange,
  queueNumber,
  nextQueueNumber,
  onConfirm,
}: EndSessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Akhiri sesi {queueNumber}?
          </DialogTitle>
          <DialogDescription className="text-base">
            Pastikan pelanggan sudah keluar dari booth.{" "}
            {buildNextTurnSentence(nextQueueNumber)} Aksi ini tidak bisa
            dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Kembali
          </DialogClose>
          <Button onClick={onConfirm}>Akhiri sesi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
