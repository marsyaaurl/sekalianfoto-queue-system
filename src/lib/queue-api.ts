const MOCK_DELAY_MS = 600
const MOCK_TURN_AFTER_MS = 30 * 1000
const MOCK_ESTIMATE_MINUTES = 20
const MOCK_QUEUE_NUMBER = 12
const MOCK_ID_BOOTH = "mock-booth-a"
const MOCK_BOOTH_CODE = "A"
const MOCK_PEOPLE_AHEAD = 4
const MOCK_BOOTH = { name: "Booth A", branch: "Blok M Square" }
const SESSION_MINUTES = 5
const MS_PER_MINUTE = 60 * 1000

// Mock mode is opt-in so a deployed build never fakes queue numbers.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export type QueueStatusValue =
  | "WAITING"
  | "IN_TURN"
  | "DONE"
  | "EXTENDED"
  | "CANCELED"

export interface CreateQueueInput {
  name: string
  phoneNumber?: string
}

export interface CreatedQueue {
  publicToken: string
  queueNumber: number
  custName: string
  queueStatus: string
  date: string
  estimatedEndAt: string
  booth: {
    name: string
    branch: string
  }
}

export interface QueueDetail {
  queueNumber: number
  custName: string
  queueStatus: QueueStatusValue
  estimatedEndAt: string
  date: string
  idBooth: string
  // Not in the API yet: the status page shows a placeholder when missing.
  peopleAhead?: number
  boothCode?: string
  estimatedWaitMinutes?: number
  booth: {
    name: string
    branch: string
  }
}

interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
    details?: {
      fieldErrors?: Record<string, string[]>
    }
  }
}

interface ErrorMessages {
  notFound: string
  badRequest: string
}

const GENERIC_ERROR_MESSAGE = "Terjadi kesalahan. Coba lagi sebentar lagi."

const CREATE_ERRORS: ErrorMessages = {
  notFound: "Booth tidak ditemukan. Coba scan ulang QR code di booth.",
  badRequest: "Data yang kamu isi belum sesuai. Periksa lagi.",
}

const GET_ERRORS: ErrorMessages = {
  notFound: "Antrean tidak ditemukan.",
  badRequest: GENERIC_ERROR_MESSAGE,
}

const CANCEL_ERRORS: ErrorMessages = {
  notFound: "Antrean tidak ditemukan.",
  badRequest: "Antrean ini sudah tidak bisa dibatalkan.",
}

export class ApiRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// The API messages are in English, so we map them to Indonesian UI text.
function getErrorMessage(
  status: number,
  body: unknown,
  messages: ErrorMessages,
): string {
  const fieldErrors = (body as ApiErrorBody | null)?.error?.details?.fieldErrors

  if (fieldErrors?.custName) return "Nama minimal 3 karakter."
  if (status === 404) return messages.notFound
  if (status === 400) return messages.badRequest
  return GENERIC_ERROR_MESSAGE
}

async function requestData<T>(
  url: string,
  init: RequestInit,
  messages: ErrorMessages,
): Promise<T> {
  const response = await fetch(url, init)
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiRequestError(
      getErrorMessage(response.status, body, messages),
      response.status,
    )
  }

  return (body as { data: T } | null)?.data as T
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// --- Mock data: one fake queue that becomes "your turn" after a while ---

let mockStartedAt: number | null = null
let mockCanceled = false

function startMockQueue(): number {
  mockStartedAt = Date.now()
  mockCanceled = false
  return mockStartedAt
}

function readMockStatus(): QueueStatusValue {
  const startedAt = mockStartedAt ?? startMockQueue()

  if (mockCanceled) return "CANCELED"
  return Date.now() - startedAt >= MOCK_TURN_AFTER_MS ? "IN_TURN" : "WAITING"
}

async function createMockQueue(input: CreateQueueInput): Promise<CreatedQueue> {
  await wait(MOCK_DELAY_MS)
  startMockQueue()

  return {
    publicToken: "mock-token-a012",
    queueNumber: MOCK_QUEUE_NUMBER,
    custName: input.name,
    queueStatus: "WAITING",
    date: new Date().toISOString(),
    estimatedEndAt: new Date(
      Date.now() + SESSION_MINUTES * MS_PER_MINUTE,
    ).toISOString(),
    booth: MOCK_BOOTH,
  }
}

async function getMockQueue(): Promise<QueueDetail> {
  await wait(MOCK_DELAY_MS)
  const startedAt = mockStartedAt ?? startMockQueue()
  const queueStatus = readMockStatus()
  const peopleAhead = queueStatus === "WAITING" ? MOCK_PEOPLE_AHEAD : 0

  return {
    queueNumber: MOCK_QUEUE_NUMBER,
    custName: "Contoh",
    queueStatus,
    estimatedEndAt: new Date(
      startedAt + MOCK_ESTIMATE_MINUTES * MS_PER_MINUTE,
    ).toISOString(),
    date: new Date().toISOString(),
    idBooth: MOCK_ID_BOOTH,
    peopleAhead,
    boothCode: MOCK_BOOTH_CODE,
    estimatedWaitMinutes: peopleAhead * SESSION_MINUTES,
    booth: MOCK_BOOTH,
  }
}

async function cancelMockQueue(): Promise<void> {
  await wait(MOCK_DELAY_MS)

  if (readMockStatus() !== "WAITING") {
    throw new ApiRequestError(CANCEL_ERRORS.badRequest, 400)
  }

  mockCanceled = true
}

// --- Public API calls ---

export async function createQueue(
  input: CreateQueueInput,
  idBooth: string,
): Promise<CreatedQueue> {
  if (USE_MOCK) return createMockQueue(input)

  return requestData<CreatedQueue>(
    `/api/queue?idBooth=${encodeURIComponent(idBooth)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        custName: input.name,
        phoneNumber: input.phoneNumber,
      }),
    },
    CREATE_ERRORS,
  )
}

export async function getQueue(publicToken: string): Promise<QueueDetail> {
  if (USE_MOCK) return getMockQueue()

  return requestData<QueueDetail>(
    `/api/queue/${encodeURIComponent(publicToken)}`,
    { method: "GET", cache: "no-store" },
    GET_ERRORS,
  )
}

export async function cancelQueue(publicToken: string): Promise<void> {
  if (USE_MOCK) return cancelMockQueue()

  await requestData<unknown>(
    `/api/queue/${encodeURIComponent(publicToken)}/cancel`,
    { method: "PATCH" },
    CANCEL_ERRORS,
  )
}