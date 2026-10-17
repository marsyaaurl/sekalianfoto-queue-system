"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface BoothFilterOption {
  id: string
  name: string
  activeQueueCount: number
}

export interface BoothFilterProps {
  booths: BoothFilterOption[]
  selectedBoothId: string | null
  onSelect: (id: string) => void
}

const PILL_CLASS = "h-11 shrink-0 gap-2 rounded-full px-5 text-base"

interface BoothPillProps {
  booth: BoothFilterOption
  isSelected: boolean
  onSelect: (id: string) => void
}

function BoothPill({ booth, isSelected, onSelect }: BoothPillProps) {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      aria-pressed={isSelected}
      className={cn(PILL_CLASS, !isSelected && "bg-card")}
      onClick={() => onSelect(booth.id)}
    >
      {booth.name}
      <span
        className={
          isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
        }
      >
        {booth.activeQueueCount}
      </span>
    </Button>
  )
}

export function BoothFilter({
  booths,
  selectedBoothId,
  onSelect,
}: BoothFilterProps) {
  return (
    <div
      role="group"
      aria-label="Pilih booth"
      className="flex gap-3 overflow-x-auto pb-1"
    >
      {booths.map((booth) => (
        <BoothPill
          key={booth.id}
          booth={booth}
          isSelected={booth.id === selectedBoothId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
