const MOCK_DELAY_MS = 600
const MOCK_SESSION_MINUTES = 5
const MS_PER_MINUTE = 60 * 1000

// Mock mode is opt-in so a deployed build never fakes queue numbers.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

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

interface CreateQueueResponse {
  message: string
  data: CreatedQueue
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

export class ApiRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// The API messages are in English, so we map them to Indonesian UI text.
function getErrorMessage(status: number, body: unknown): string {
  const fieldErrors = (body as ApiErrorBody | null)?.error?.details?.fieldErrors

  if (fieldErrors?.custName) return "Nama minimal 3 karakter."
  if (status === 404) {
    return "Booth tidak ditemukan. Coba scan ulang QR code di booth."
  }
  if (status === 400) return "Data yang kamu isi belum sesuai. Periksa lagi."
  return "Terjadi kesalahan. Coba lagi sebentar lagi."
}

async function createMockQueue(input: CreateQueueInput): Promise<CreatedQueue> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))

  return {
    publicToken: "mock-token-a012",
    queueNumber: 12,
    custName: input.name,
    queueStatus: "WAITING",
    date: new Date().toISOString(),
    estimatedEndAt: new Date(
      Date.now() + MOCK_SESSION_MINUTES * MS_PER_MINUTE,
    ).toISOString(),
    booth: { name: "Booth A", branch: "Blok M Square" },
  }
}

export async function createQueue(
  input: CreateQueueInput,
  idBooth: string,
): Promise<CreatedQueue> {
  if (USE_MOCK) return createMockQueue(input)

  const response = await fetch(
    `/api/queue?idBooth=${encodeURIComponent(idBooth)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        custName: input.name,
        phoneNumber: input.phoneNumber,
      }),
    },
  )

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiRequestError(
      getErrorMessage(response.status, body),
      response.status,
    )
  }

  return (body as CreateQueueResponse).data
}