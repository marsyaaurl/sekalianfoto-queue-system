"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: "Antrean", href: "/admin/antrean" },
  { label: "Booth", href: "/admin/booth" },
]

const LOGO_WIDTH = 150
const LOGO_HEIGHT = 45

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
          ? "bg-background/20 text-background"
          : "text-background/70 hover:text-background"
      )}
    >
      {item.label}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col gap-8 bg-foreground p-4 text-background">
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
      </nav>
    </aside>
  )
}
