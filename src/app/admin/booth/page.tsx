"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react"

import { AddBoothForm, type AddBoothFormValues } from "@/components/admin/AddBoothForm"
import { BoothTable } from "@/components/admin/BoothTable"
import { DeleteBoothDialog } from "@/components/admin/DeleteBoothDialog"
import { QRDialog } from "@/components/admin/QRDialog"
import { Button } from "@/components/ui/button"
import {
  downloadQrImage,
  useBooths,
  type BoothLoadStatus,
  type ManagedBooth,
} from "@/hooks/useBooths"
import { cn } from "@/lib/utils"

type NoticeTone = "error" | "success"

interface Notice {
  tone: NoticeTone
  message: string
}

interface QrTarget {
  name: string
  qrFilePath: string | null
  isNewlyCreated: boolean
}

const SKELETON_ROW_COUNT = 5

const BOOTH_UPDATED_MESSAGE = "Perubahan booth disimpan."
const BOOTH_DELETED_MESSAGE = "Booth dihapus."
const QR_UNAVAILABLE_MESSAGE = "QR belum tersedia untuk booth ini."
const QR_DOWNLOAD_FAILED_MESSAGE = "Gagal mengunduh QR. Coba lagi."

const NOTICE_STYLES: Record<NoticeTone, string> = {
  error: "border-destructive/50 bg-destructive/10 text-destructive",
  success: "border-success-dark/30 bg-success-light text-success-dark",
}

interface NoticeBannerProps {
  notice: Notice
  onDismiss: () => void
}

function NoticeBanner({ notice, onDismiss }: NoticeBannerProps) {
  return (
    <div
      role={notice.tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border px-4 py-3",
        NOTICE_STYLES[notice.tone],
      )}
    >
      <p>{notice.message}</p>
      <Button variant="ghost" size="sm" onClick={onDismiss}>
        Tutup
      </Button>
    </div>
  )
}

function BoothTableSkeleton() {
  return (
    <div role="status" className="overflow-hidden rounded-xl border">
      <span className="sr-only">Memuat booth...</span>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse border-b bg-muted/50 last:border-b-0"
        />
      ))}
    </div>
  )
}

interface LoadErrorProps {
  message: string
  onRetry: () => void
}

function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border p-6"
    >
      <p className="text-destructive">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Coba lagi
      </Button>
    </div>
  )
}

interface BoothContentProps {
  loadStatus: BoothLoadStatus
  loadError: string
  onRetry: () => void
  table: React.ReactNode
}

function BoothContent({
  loadStatus,
  loadError,
  onRetry,
  table,
}: BoothContentProps) {
  if (loadStatus === "loading") return <BoothTableSkeleton />
  if (loadStatus === "error") {
    return <LoadError message={loadError} onRetry={onRetry} />
  }
  return table
}

export default function AdminBoothPage() {
  const {
    booths,
    loadStatus,
    loadError,
    pendingBoothId,
    isCreating,
    retry,
    createBooth,
    updateBooth,
    deleteBooth,
  } = useBooths()

  const [isFormOpen, setIsFormOpen] = useState(false)
  // Kept after closing so the dialog does not flip its copy while it fades out.
  const [formBooth, setFormBooth] = useState<ManagedBooth | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ManagedBooth | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  const findBooth = (id: string) => booths.find((booth) => booth.id === id)

  const openForm = (booth: ManagedBooth | null) => {
    setNotice(null)
    setFormError(null)
    setFormBooth(booth)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (values: AddBoothFormValues) => {
    setFormError(null)

    if (formBooth) {
      const result = await updateBooth(formBooth.id, values)
      if (!result.ok) return setFormError(result.message)
      setIsFormOpen(false)
      setNotice({ tone: "success", message: BOOTH_UPDATED_MESSAGE })
      return
    }

    const result = await createBooth(values)
    if (!result.ok) return setFormError(result.message)
    setIsFormOpen(false)
    setQrTarget({
      name: result.data.name,
      qrFilePath: result.data.qrFilePath,
      isNewlyCreated: true,
    })
  }

  const handleDownload = async (name: string, qrFilePath: string | null) => {
    setNotice(null)
    if (!qrFilePath) {
      setNotice({ tone: "error", message: QR_UNAVAILABLE_MESSAGE })
      return
    }
    const isSaved = await downloadQrImage(name, qrFilePath)
    if (!isSaved) {
      setNotice({ tone: "error", message: QR_DOWNLOAD_FAILED_MESSAGE })
    }
  }

  const handleViewQr = (id: string) => {
    const booth = findBooth(id)
    if (!booth) return
    setQrTarget({
      name: booth.name,
      qrFilePath: booth.qrFilePath,
      isNewlyCreated: false,
    })
  }

  const handleDownloadFromTable = (id: string) => {
    const booth = findBooth(id)
    if (booth) handleDownload(booth.name, booth.qrFilePath)
  }

  const handleOpenDelete = (id: string) => {
    const booth = findBooth(id)
    if (!booth) return
    setNotice(null)
    setDeleteError(null)
    setDeleteTarget(booth)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteBooth(deleteTarget.id)
    if (!result.ok) return setDeleteError(result.message)
    setDeleteTarget(null)
    setNotice({ tone: "success", message: BOOTH_DELETED_MESSAGE })
  }

  const isFormSubmitting = formBooth
    ? pendingBoothId === formBooth.id
    : isCreating

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">Booth</h1>
        <Button size="lg" className="h-12 px-5 text-base" onClick={() => openForm(null)}>
          <PlusIcon />
          Tambah booth
        </Button>
      </header>

      {notice && (
        <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />
      )}

      <BoothContent
        loadStatus={loadStatus}
        loadError={loadError}
        onRetry={retry}
        table={
          <BoothTable
            booths={booths}
            pendingBoothId={pendingBoothId}
            onViewQr={handleViewQr}
            onDownloadQr={handleDownloadFromTable}
            onEdit={(id) => openForm(findBooth(id) ?? null)}
            onDelete={handleOpenDelete}
          />
        }
      />

      <AddBoothForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formBooth ? "edit" : "create"}
        initialValues={
          formBooth
            ? { name: formBooth.name, branch: formBooth.branch }
            : undefined
        }
        isSubmitting={isFormSubmitting}
        errorMessage={formError}
        onSubmit={handleFormSubmit}
      />

      <QRDialog
        open={qrTarget !== null}
        onOpenChange={(open) => {
          if (!open) setQrTarget(null)
        }}
        boothName={qrTarget?.name ?? ""}
        qrImageSrc={qrTarget?.qrFilePath ?? ""}
        isNewlyCreated={qrTarget?.isNewlyCreated}
        onDownload={() =>
          qrTarget && handleDownload(qrTarget.name, qrTarget.qrFilePath)
        }
      />

      <DeleteBoothDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        boothName={deleteTarget?.name ?? ""}
        activeQueueCount={deleteTarget?.activeQueueCount ?? 0}
        isSubmitting={
          deleteTarget !== null && pendingBoothId === deleteTarget.id
        }
        errorMessage={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
