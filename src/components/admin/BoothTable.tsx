"use client"

import { PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface Booth {
  id: string
  name: string
  branch: string
  activeQueueCount: number
}

export interface BoothTableProps {
  booths: Booth[]
  onViewQr: (id: string) => void
  onDownloadQr: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  pendingBoothId?: string | null
}

const COLUMN_HEADERS = [
  "Nama booth",
  "Cabang",
  "Antrean aktif",
  "QR code",
  "Aksi",
] as const

const QUEUE_COUNT_UNIT = "orang"
const EMPTY_QUEUE_LABEL = "Kosong"

const ICON_BUTTON_CLASS = "rounded-lg"
const DELETE_BUTTON_CLASS =
  "text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"

interface QrActionsProps {
  booth: Booth
  isPending: boolean
  onViewQr: (id: string) => void
  onDownloadQr: (id: string) => void
}

function QrActions({
  booth,
  isPending,
  onViewQr,
  onDownloadQr,
}: QrActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => onViewQr(booth.id)}
      >
        Lihat QR
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => onDownloadQr(booth.id)}
      >
        Unduh
      </Button>
    </div>
  )
}

interface ManageActionsProps {
  booth: Booth
  isPending: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

function ManageActions({
  booth,
  isPending,
  onEdit,
  onDelete,
}: ManageActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-lg"
        className={ICON_BUTTON_CLASS}
        disabled={isPending}
        aria-label={`Ubah ${booth.name}`}
        onClick={() => onEdit(booth.id)}
      >
        <PencilIcon />
      </Button>
      <Button
        variant="outline"
        size="icon-lg"
        className={cn(ICON_BUTTON_CLASS, DELETE_BUTTON_CLASS)}
        disabled={isPending}
        aria-label={`Hapus ${booth.name}`}
        onClick={() => onDelete(booth.id)}
      >
        <Trash2Icon />
      </Button>
    </div>
  )
}

function formatActiveQueue(count: number): string {
  return count === 0 ? EMPTY_QUEUE_LABEL : `${count} ${QUEUE_COUNT_UNIT}`
}

function EmptyRow() {
  return (
    <TableRow>
      <TableCell
        colSpan={COLUMN_HEADERS.length}
        className="h-24 text-center text-muted-foreground"
      >
        Belum ada booth
      </TableCell>
    </TableRow>
  )
}

export function BoothTable({
  booths,
  onViewQr,
  onDownloadQr,
  onEdit,
  onDelete,
  pendingBoothId = null,
}: BoothTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {COLUMN_HEADERS.map((header) => (
              <TableHead
                key={header}
                className="h-12 px-4 text-muted-foreground"
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {booths.length === 0 && <EmptyRow />}
          {booths.map((booth) => (
            <TableRow key={booth.id} className="h-16">
              <TableCell className="px-4 font-bold">{booth.name}</TableCell>
              <TableCell className="px-4">{booth.branch}</TableCell>
              <TableCell className="px-4">
                {formatActiveQueue(booth.activeQueueCount)}
              </TableCell>
              <TableCell className="px-4">
                <QrActions
                  booth={booth}
                  isPending={pendingBoothId === booth.id}
                  onViewQr={onViewQr}
                  onDownloadQr={onDownloadQr}
                />
              </TableCell>
              <TableCell className="px-4">
                <ManageActions
                  booth={booth}
                  isPending={pendingBoothId === booth.id}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
