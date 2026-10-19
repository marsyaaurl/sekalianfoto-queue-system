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

export type QueueEntryStatus =
  | "WAITING"
  | "IN_TURN"
  | "EXTENDED"
  | "DONE"
  | "CANCELED"

export interface QueueEntry {
  id: string
  queueNumber: string
  name: string
  phoneNumber: string | null
  status: QueueEntryStatus
}

export interface QueueTableProps {
  entries: QueueEntry[]
  onStartSession: (id: string) => void
  onExtendSession: (id: string) => void
  onEndSession: (id: string) => void
  pendingEntryId?: string | null
}

export interface RowActionAvailability {
  canStart: boolean
  canExtend: boolean
  canEnd: boolean
}

const EXTEND_SESSION_MINUTES = 5
const EMPTY_PHONE_PLACEHOLDER = "-"
const STATUS_BADGE_CLASS = "h-6 px-2.5 text-xs"
const ROW_BUTTON_CLASS = "h-8 px-3 text-xs"
const COLUMN_HEADERS = ["No.", "Nama", "No. telepon", "Status", "Aksi"] as const

// Only one entry can be active at a time; these statuses mean "inside the booth".
const ACTIVE_STATUSES: readonly QueueEntryStatus[] = ["IN_TURN", "EXTENDED"]

const NO_ACTIONS: RowActionAvailability = {
  canStart: false,
  canExtend: false,
  canEnd: false,
}
const ACTIVE_ROW_ACTIONS: RowActionAvailability = {
  canStart: false,
  canExtend: true,
  canEnd: true,
}
const START_ROW_ACTIONS: RowActionAvailability = {
  canStart: true,
  canExtend: false,
  canEnd: false,
}

interface StatusPill {
  label: string
  variant: "destructive" | "secondary" | "outline"
  className?: string
}

// Every pill carries a text label, so meaning never relies on colour alone.
const STATUS_PILLS: Record<QueueEntryStatus, StatusPill> = {
  WAITING: { label: "Menunggu", variant: "secondary" },
  IN_TURN: { label: "Di dalam booth", variant: "destructive" },
  EXTENDED: { label: "Di dalam booth", variant: "destructive" },
  DONE: {
    label: "Selesai",
    variant: "secondary",
    className: "bg-success-light text-success-dark",
  },
  CANCELED: {
    label: "Dibatalkan",
    variant: "outline",
    className: "text-muted-foreground",
  },
}

function isActiveEntry(entry: QueueEntry): boolean {
  return ACTIVE_STATUSES.includes(entry.status)
}

// "A010" -> 10. Entries without digits sort last.
function getQueueNumberValue(queueNumber: string): number {
  const digits = queueNumber.match(/\d+/)
  return digits ? Number(digits[0]) : Number.POSITIVE_INFINITY
}

function sortByQueueNumber(entries: QueueEntry[]): QueueEntry[] {
  return [...entries].sort(
    (a, b) =>
      getQueueNumberValue(a.queueNumber) - getQueueNumberValue(b.queueNumber)
  )
}

export function getRowActions(
  entry: QueueEntry,
  entries: QueueEntry[]
): RowActionAvailability {
  if (isActiveEntry(entry)) return ACTIVE_ROW_ACTIONS
  if (entry.status !== "WAITING") return NO_ACTIONS
  if (entries.some(isActiveEntry)) return NO_ACTIONS

  const earliestWaiting = sortByQueueNumber(entries).find(
    (candidate) => candidate.status === "WAITING"
  )
  return earliestWaiting?.id === entry.id ? START_ROW_ACTIONS : NO_ACTIONS
}

function StatusBadge({ status }: { status: QueueEntryStatus }) {
  const { label, variant, className } = STATUS_PILLS[status]
  return (
    <Badge variant={variant} className={cn(STATUS_BADGE_CLASS, className)}>
      {label}
    </Badge>
  )
}

interface RowActionsProps {
  entry: QueueEntry
  actions: RowActionAvailability
  isPending: boolean
  onStartSession: (id: string) => void
  onExtendSession: (id: string) => void
  onEndSession: (id: string) => void
}

function RowActions({
  entry,
  actions,
  isPending,
  onStartSession,
  onExtendSession,
  onEndSession,
}: RowActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {actions.canStart && (
        <Button
          size="sm"
          className={ROW_BUTTON_CLASS}
          disabled={isPending}
          onClick={() => onStartSession(entry.id)}
        >
          Start session
        </Button>
      )}
      {actions.canExtend && (
        <Button
          variant="outline"
          size="sm"
          className={ROW_BUTTON_CLASS}
          disabled={isPending}
          onClick={() => onExtendSession(entry.id)}
        >
          Extend +{EXTEND_SESSION_MINUTES}
        </Button>
      )}
      {actions.canEnd && (
        <Button
          size="sm"
          className={ROW_BUTTON_CLASS}
          disabled={isPending}
          onClick={() => onEndSession(entry.id)}
        >
          End session
        </Button>
      )}
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
  onStartSession,
  onExtendSession,
  onEndSession,
  pendingEntryId = null,
}: QueueTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table className="text-sm">
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
          {sortByQueueNumber(entries).map((entry) => (
            <TableRow
              key={entry.id}
              className={cn("h-16", isActiveEntry(entry) && "bg-accent/10")}
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
                  actions={getRowActions(entry, entries)}
                  isPending={pendingEntryId === entry.id}
                  onStartSession={onStartSession}
                  onExtendSession={onExtendSession}
                  onEndSession={onEndSession}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
