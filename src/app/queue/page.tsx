"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"

import QueueForm from "@/components/cust/QueueForm"
import { ApiRequestError, createQueue } from "@/lib/queue-api"

const MISSING_BOOTH_MESSAGE =
  "Booth tidak ditemukan. Coba scan ulang QR code di booth."
const GENERIC_ERROR_MESSAGE = "Terjadi kesalahan. Coba lagi sebentar lagi."

interface QueuePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

interface QueueFormData {
  name: string
  phone_number?: string
}

export default function QueuePage({ searchParams }: QueuePageProps) {
  const router = useRouter()
  const params = use(searchParams)
  const idBooth = typeof params.idBooth === "string" ? params.idBooth : ""

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleSubmit = async (data: QueueFormData) => {
    if (!idBooth) {
      setSubmitError(MISSING_BOOTH_MESSAGE)
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const queue = await createQueue(
        { name: data.name, phoneNumber: data.phone_number },
        idBooth,
      )
      router.push(`/queue/${queue.publicToken}`)
    } catch (error) {
      setSubmitError(
        error instanceof ApiRequestError
          ? error.message
          : GENERIC_ERROR_MESSAGE,
      )
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="mb-1 text-3xl font-bold text-foreground">
        Ambil Nomor Antrean
      </h1>
      <p className="mb-6 text-foreground/70">
        Isi nama lalu pantau antreanmu dari mana saja di sekitar mall.
      </p>
      {submitError && (
        <p role="alert" className="mb-4 text-error">
          {submitError}
        </p>
      )}
      <QueueForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </>
  )
}