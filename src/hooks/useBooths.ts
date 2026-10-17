import { useEffect, useState } from "react"

import type { Booth } from "@/components/admin/BoothTable"

export interface ManagedBooth extends Booth {
  qrFilePath: string | null
  activeQueueCount: number
}

export interface BoothInput {
  name: string
  branch: string
}

export type MutationResult<TData = void> =
  | { ok: true; data: TData }
  | { ok: false; message: string }

export type BoothLoadStatus = "loading" | "ready" | "error"

// Mirrors the fields GET /api/booth selects.
interface BoothRecord {
  id: string
  name: string
  branch: string
  qrFilePath: string | null
  activeQueueCount: number
}

interface ApiResponse {
  ok: boolean
  status: number
  data: unknown
}

type RequestKind = "load" | "save" | "delete"

const BOOTH_ENDPOINT = "/api/booth"
const NETWORK_ERROR_STATUS = 0
const HTTP_BAD_REQUEST = 400
const HTTP_UNAUTHORIZED = 401
const HTTP_NOT_FOUND = 404

const QR_FILE_EXTENSION = "png"
const BOOTH_SLUG_FALLBACK = "booth"

const FALLBACK_MESSAGES: Record<RequestKind, string> = {
  load: "Gagal memuat booth.",
  save: "Gagal menyimpan booth. Coba lagi.",
  delete: "Gagal menghapus booth. Coba lagi.",
}
const UNAUTHORIZED_MESSAGE = "Sesi berakhir. Masuk lagi untuk melanjutkan."
const NOT_FOUND_MESSAGE = "Booth tidak ditemukan."
const INVALID_INPUT_MESSAGE = "Nama dan cabang minimal 5 karakter."

// The API messages are in English, so we map the HTTP status to Indonesian UI text.
function getErrorMessage(kind: RequestKind, status: number): string {
  if (status === HTTP_UNAUTHORIZED) return UNAUTHORIZED_MESSAGE
  if (status === HTTP_NOT_FOUND && kind !== "load") return NOT_FOUND_MESSAGE
  if (status === HTTP_BAD_REQUEST && kind === "save") return INVALID_INPUT_MESSAGE
  return FALLBACK_MESSAGES[kind]
}

async function sendRequest(
  url: string,
  init: RequestInit,
): Promise<ApiResponse> {
  try {
    const response = await fetch(url, init)
    const body: { data?: unknown } | null = await response
      .json()
      .catch(() => null)
    return { ok: response.ok, status: response.status, data: body?.data }
  } catch {
    return { ok: false, status: NETWORK_ERROR_STATUS, data: undefined }
  }
}

function jsonRequest(method: "POST" | "PATCH", input: BoothInput): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }
}

function boothUrl(id: string): string {
  return `${BOOTH_ENDPOINT}/${encodeURIComponent(id)}`
}

function toManagedBooth(record: BoothRecord): ManagedBooth {
  return {
    id: record.id,
    name: record.name,
    branch: record.branch,
    qrFilePath: record.qrFilePath,
    activeQueueCount: record.activeQueueCount,
  }
}

function failure(kind: RequestKind, status: number) {
  return { ok: false, message: getErrorMessage(kind, status) } as const
}

function slugifyBoothName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || BOOTH_SLUG_FALLBACK
}

// Resolves to false when the image cannot be fetched or saved.
export async function downloadQrImage(
  boothName: string,
  src: string,
): Promise<boolean> {
  try {
    const response = await fetch(src)
    if (!response.ok) return false

    const objectUrl = URL.createObjectURL(await response.blob())
    const link = document.createElement("a")
    link.href = objectUrl
    link.download = `qr-${slugifyBoothName(boothName)}.${QR_FILE_EXTENSION}`
    link.click()
    URL.revokeObjectURL(objectUrl)
    return true
  } catch {
    return false
  }
}

export function useBooths() {
  const [booths, setBooths] = useState<ManagedBooth[]>([])
  const [loadStatus, setLoadStatus] = useState<BoothLoadStatus>("loading")
  const [loadError, setLoadError] = useState("")
  const [pendingBoothId, setPendingBoothId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let isActive = true

    const load = async () => {
      const response = await sendRequest(BOOTH_ENDPOINT, {
        method: "GET",
        cache: "no-store",
      })
      if (!isActive) return

      if (!response.ok) {
        setLoadError(getErrorMessage("load", response.status))
        // A failed refresh keeps the last known list; only the first load shows an error.
        setLoadStatus((current) => (current === "ready" ? current : "error"))
        return
      }

      setBooths((response.data as BoothRecord[]).map(toManagedBooth))
      setLoadStatus("ready")
    }

    load()

    return () => {
      isActive = false
    }
  }, [reloadCount])

  const refetch = () => setReloadCount((count) => count + 1)

  const retry = () => {
    setLoadStatus("loading")
    refetch()
  }

  const createBooth = async (
    input: BoothInput,
  ): Promise<MutationResult<ManagedBooth>> => {
    setIsCreating(true)
    const response = await sendRequest(
      BOOTH_ENDPOINT,
      jsonRequest("POST", input),
    )
    setIsCreating(false)

    if (!response.ok) return failure("save", response.status)

    refetch()
    return { ok: true, data: toManagedBooth(response.data as BoothRecord) }
  }

  const updateBooth = async (
    id: string,
    input: BoothInput,
  ): Promise<MutationResult> => {
    setPendingBoothId(id)
    const response = await sendRequest(boothUrl(id), jsonRequest("PATCH", input))
    setPendingBoothId(null)

    if (!response.ok) return failure("save", response.status)

    refetch()
    return { ok: true, data: undefined }
  }

  const deleteBooth = async (id: string): Promise<MutationResult> => {
    setPendingBoothId(id)
    const response = await sendRequest(boothUrl(id), { method: "DELETE" })
    setPendingBoothId(null)

    if (!response.ok) return failure("delete", response.status)

    refetch()
    return { ok: true, data: undefined }
  }

  return {
    booths,
    loadStatus,
    loadError,
    pendingBoothId,
    isCreating,
    refetch,
    retry,
    createBooth,
    updateBooth,
    deleteBooth,
  }
}
