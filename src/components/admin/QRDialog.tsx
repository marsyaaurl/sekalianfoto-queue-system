"use client"

import Image from "next/image"

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

export interface QRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boothName: string
  qrImageSrc: string
  onDownload: () => void
  isNewlyCreated?: boolean
}

const QR_IMAGE_SIZE = 240

function buildTitle(boothName: string, isNewlyCreated: boolean): string {
  return isNewlyCreated ? `${boothName} berhasil dibuat` : `QR ${boothName}`
}

interface QRPreviewProps {
  boothName: string
  qrImageSrc: string
}

function QRPreview({ boothName, qrImageSrc }: QRPreviewProps) {
  return (
    <div className="flex justify-center rounded-xl border p-8">
      {qrImageSrc ? (
        // QR images are generated elsewhere (often data URLs), so skip Next's optimizer.
        <Image
          src={qrImageSrc}
          alt={`QR code ${boothName}`}
          width={QR_IMAGE_SIZE}
          height={QR_IMAGE_SIZE}
          unoptimized
        />
      ) : (
        <div
          aria-hidden
          className="rounded-lg bg-muted"
          style={{ width: QR_IMAGE_SIZE, height: QR_IMAGE_SIZE }}
        />
      )}
    </div>
  )
}

export function QRDialog({
  open,
  onOpenChange,
  boothName,
  qrImageSrc,
  onDownload,
  isNewlyCreated = true,
}: QRDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {buildTitle(boothName, isNewlyCreated)}
          </DialogTitle>
          <DialogDescription className="text-base">
            Pasang QR ini di booth. Pelanggan yang scan akan masuk ke antrean{" "}
            {boothName}.
          </DialogDescription>
        </DialogHeader>
        <QRPreview boothName={boothName} qrImageSrc={qrImageSrc} />
        <DialogFooter>
          <Button variant="outline" onClick={onDownload}>
            Unduh QR
          </Button>
          <DialogClose render={<Button />}>Selesai</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
