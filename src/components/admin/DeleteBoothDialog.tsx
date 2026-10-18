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

export interface DeleteBoothDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boothName: string
  activeQueueCount: number
  onConfirm: () => void
  isSubmitting?: boolean
  errorMessage?: string | null
}

const DELETE_WARNING =
  "Booth, QR code, dan seluruh data antreannya akan dihapus permanen. Pelanggan tidak bisa lagi scan QR ini."
const CONFIRM_BUTTON_CLASS =
  "bg-destructive text-primary-foreground hover:bg-destructive/90"

function buildActiveQueueWarning(activeQueueCount: number): string | null {
  if (activeQueueCount <= 0) return null
  return `Masih ada ${activeQueueCount} orang di antrean booth ini.`
}

export function DeleteBoothDialog({
  open,
  onOpenChange,
  boothName,
  activeQueueCount,
  onConfirm,
  isSubmitting = false,
  errorMessage = null,
}: DeleteBoothDialogProps) {
  const activeQueueWarning = buildActiveQueueWarning(activeQueueCount)

  // Keep the dialog open while the delete request is running.
  function handleOpenChange(nextOpen: boolean) {
    if (!isSubmitting) onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Hapus {boothName}?</DialogTitle>
          <DialogDescription className="text-base">
            {DELETE_WARNING}
            {activeQueueWarning && ` ${activeQueueWarning}`}
          </DialogDescription>
        </DialogHeader>
        {errorMessage && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}
        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isSubmitting} />}
          >
            Kembali
          </DialogClose>
          <Button
            className={CONFIRM_BUTTON_CLASS}
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            Hapus booth
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
