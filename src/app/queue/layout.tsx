import Image from "next/image"
import type { ReactNode } from "react"

interface QueueLayoutProps {
  children: ReactNode
}

export default function QueueLayout({ children }: QueueLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-muted-foreground">
        <div className="mx-auto w-full max-w-md px-6">
          <Image
            src="/logo.png"
            alt="Sekalian Foto"
            width={160}
            height={40}
            priority
            className="-ml-3 -translate-y-3 h-18 w-auto"
          />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col p-6">
        {children}
      </main>
    </div>
  )
}