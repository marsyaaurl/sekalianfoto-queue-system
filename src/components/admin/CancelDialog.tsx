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
}

export function CancelDialog({
  open,
  onOpenChange,
  queueNumber,
  onConfirm,
}: CancelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Batalkan antrean {queueNumber}?
          </DialogTitle>
          <DialogDescription className="text-base">
            {queueNumber} keluar dari antrean dan posisi di belakangnya maju
            satu. Pelanggan akan melihat status Dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Kembali
          </DialogClose>
          <Button onClick={onConfirm}>Batalkan antrean</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
