"use client"

import { Badge } from "@/components/ui/badge"
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

export type QueueEntryStatus = "IN_BOOTH" | "WAITING"

export interface QueueEntry {
  id: string
  queueNumber: string
  name: string
  phoneNumber: string | null
  status: QueueEntryStatus
}

export interface QueueTableProps {
  entries: QueueEntry[]
  onExtendSession: (id: string) => void
  onEndSession: (id: string) => void
  onCancel: (id: string) => void
}

const EXTEND_SESSION_MINUTES = 5
const EMPTY_PHONE_PLACEHOLDER = "-"
const COLUMN_HEADERS = ["No.", "Nama", "No. telepon", "Status", "Aksi"] as const

const CANCEL_BUTTON_CLASS =
  "text-destructive border-destructive/50 hover:bg-destructive/10"

function StatusBadge({ status }: { status: QueueEntryStatus }) {
  if (status === "IN_BOOTH") {
    return <Badge variant="destructive">Di dalam booth</Badge>
  }
  return <Badge variant="secondary">Menunggu</Badge>
}

interface RowActionsProps {
  entry: QueueEntry
  onExtendSession: (id: string) => void
  onEndSession: (id: string) => void
  onCancel: (id: string) => void
}

function RowActions({
  entry,
  onExtendSession,
  onEndSession,
  onCancel,
}: RowActionsProps) {
  const cancelButton = (
    <Button
      variant="outline"
      size="sm"
      className={CANCEL_BUTTON_CLASS}
      onClick={() => onCancel(entry.id)}
    >
      Batalkan
    </Button>
  )

  if (entry.status === "WAITING") {
    return cancelButton
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExtendSession(entry.id)}
      >
        Extend +{EXTEND_SESSION_MINUTES}
      </Button>
      {cancelButton}
      <Button size="sm" onClick={() => onEndSession(entry.id)}>
        End session
      </Button>
    </div>
  )
}

function EmptyRow() {
  return (
    <TableRow>
      <TableCell
        colSpan={COLUMN_HEADERS.length}
        className="h-24 text-center text-muted-foreground"
      >
        Belum ada antrean
      </TableCell>
    </TableRow>
  )
}

export function QueueTable({
  entries,
  onExtendSession,
  onEndSession,
  onCancel,
}: QueueTableProps) {
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
          {entries.length === 0 && <EmptyRow />}
          {entries.map((entry) => (
            <TableRow
              key={entry.id}
              className={cn(
                "h-14",
                entry.status === "IN_BOOTH" && "bg-accent/10"
              )}
            >
              <TableCell className="px-4 font-bold">
                {entry.queueNumber}
              </TableCell>
              <TableCell className="px-4">{entry.name}</TableCell>
              <TableCell className="px-4">
                {entry.phoneNumber ?? EMPTY_PHONE_PLACEHOLDER}
              </TableCell>
              <TableCell className="px-4">
                <StatusBadge status={entry.status} />
              </TableCell>
              <TableCell className="px-4">
                <RowActions
                  entry={entry}
                  onExtendSession={onExtendSession}
                  onEndSession={onEndSession}
                  onCancel={onCancel}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
