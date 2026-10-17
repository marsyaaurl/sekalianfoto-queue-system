"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import BranchLocationBadge from "@/components/cust/badge/BranchLocationBadge"
import QueueForm from "@/components/cust/QueueForm"
import {
  ApiRequestError,
  createQueue,
  getBooth,
  type BoothDetail,
} from "@/lib/queue-api"

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
  const [booth, setBooth] = useState<BoothDetail | null>(null)

  useEffect(() => {
    if (!idBooth) return

    let isActive = true

    getBooth(idBooth)
      .then((boothData) => {
        if (isActive) setBooth(boothData)
      })
      .catch(() => {
        if (isActive) setSubmitError(MISSING_BOOTH_MESSAGE)
      })

    return () => {
      isActive = false
    }
  }, [idBooth])

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
    <div className="flex flex-1 flex-col justify-center gap-6 pb-10">
      <div className="px-2">
        <h1 className="mt-2 text-3xl font-extrabold text-accent">
          Ambil Nomor Antrean
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Isi data singkatmu, lalu pantau antrean dari mana saja.
        </p>
        {booth && (
          <div className="mt-4">
            <BranchLocationBadge
              boothName={booth.name}
              branch={booth.branch}
            />
          </div>
        )}
      </div>
      {submitError && (
        <p role="alert" className="rounded-xl bg-error-light px-4 py-3 text-error">
          {submitError}
        </p>
      )}
      <QueueForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  )
}
