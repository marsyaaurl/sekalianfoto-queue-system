"use client"

import Image from "next/image"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface QueueLayoutProps {
  children: ReactNode
}

const QueuePageAccentContext = createContext<(isAccent: boolean) => void>(() => {})

export function useQueuePageAccent(isAccent: boolean) {
  const setPageAccent = useContext(QueuePageAccentContext)

  useEffect(() => {
    setPageAccent(isAccent)
    return () => setPageAccent(false)
  }, [isAccent, setPageAccent])
}

export default function QueueLayout({ children }: QueueLayoutProps) {
  const [isPageAccent, setIsPageAccent] = useState(false)

  return (
    <QueuePageAccentContext.Provider value={setIsPageAccent}>
      <div
        className={`flex min-h-screen flex-col ${
          isPageAccent ? "bg-accent" : "bg-background"
        }`}
      >
        <header
          className="sticky top-4 z-10 mx-auto mt-4 flex h-16 w-[calc(100%-2rem)] max-w-md items-center rounded-full border border-white/10 bg-foreground/95 px-6 shadow-[0_10px_30px_rgb(50_35_28/0.24)] backdrop-blur-xl"
        >
          <div>
            <Image
              src="/logov2.png"
              alt="Sekalian Foto"
              width={140}
              height={20}
              priority
              className="h-8 w-auto object-contain"
            />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col p-6">
          {children}
        </main>
      </div>
    </QueuePageAccentContext.Provider>
  )
}
