"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: "Antrean", href: "/admin/queue" },
  { label: "Booth", href: "/admin/booth" },
]

const LOGO_WIDTH = 150
const LOGO_HEIGHT = 45

const LOGOUT_ENDPOINT = "/api/auth/logout"
const LOGIN_PATH = "/auth/login"

interface SidebarNavLinkProps {
  item: NavItem
  isActive: boolean
}

function SidebarNavLink({ item, isActive }: SidebarNavLinkProps) {
  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-lg px-4 py-3 text-lg font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
      )}
    >
      {item.label}
    </Link>
  )
}

function SidebarLogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const response = await fetch(LOGOUT_ENDPOINT, { method: "POST" }).catch(
      () => null
    )
    setIsLoggingOut(false)

    // Stay on the page when logout fails, so the user can try again.
    if (!response?.ok) return
    router.push(LOGIN_PATH)
    router.refresh()
  }

  return (
    <button
      type="button"
      disabled={isLoggingOut}
      onClick={handleLogout}
      className="rounded-lg px-4 py-3 text-left text-lg font-medium text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground disabled:opacity-50"
    >
      Logout
    </button>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col gap-8 bg-sidebar p-4 text-sidebar-foreground">
      <Image
        src="/logo.png"
        alt="Sekalian foto"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority
        className="mt-2 ml-2"
      />
      <nav aria-label="Navigasi admin" className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <SidebarNavLink
            key={item.href}
            item={item}
            isActive={pathname.startsWith(item.href)}
          />
        ))}
        <SidebarLogoutButton />
      </nav>
    </aside>
  )
}
