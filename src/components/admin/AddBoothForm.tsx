"use client"

import { useId, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface AddBoothFormValues {
  name: string
  branch: string
}

export interface AddBoothFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AddBoothFormValues) => void
}

const NAME_REQUIRED_ERROR = "Nama booth wajib diisi."
const LABEL_CLASS = "text-base font-semibold"
const INPUT_CLASS = "h-11 bg-card px-3"

function getNameError(name: string): string | null {
  return name.trim() === "" ? NAME_REQUIRED_ERROR : null
}

interface AddBoothFieldsProps {
  onSubmit: (values: AddBoothFormValues) => void
}

// Lives inside DialogContent, which unmounts on close, so the form resets itself.
function AddBoothFields({ onSubmit }: AddBoothFieldsProps) {
  const [name, setName] = useState("")
  const [branch, setBranch] = useState("")
  const [nameError, setNameError] = useState<string | null>(null)

  const nameId = useId()
  const nameErrorId = useId()
  const branchId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const error = getNameError(name)
    setNameError(error)
    if (error) return
    onSubmit({ name: name.trim(), branch: branch.trim() })
  }

  function handleNameChange(value: string) {
    setName(value)
    if (nameError) setNameError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor={nameId} className={LABEL_CLASS}>
          Nama Booth
        </Label>
        <Input
          id={nameId}
          className={INPUT_CLASS}
          placeholder="Contoh: Booth A"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          aria-invalid={nameError !== null}
          aria-describedby={nameError ? nameErrorId : undefined}
        />
        {nameError && (
          <p id={nameErrorId} className="text-sm text-destructive">
            {nameError}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={branchId} className={LABEL_CLASS}>
          Cabang
        </Label>
        <Input
          id={branchId}
          className={INPUT_CLASS}
          placeholder="Contoh: Tangerang"
          value={branch}
          onChange={(event) => setBranch(event.target.value)}
        />
      </div>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Batal
        </DialogClose>
        <Button type="submit">Simpan booth</Button>
      </DialogFooter>
    </form>
  )
}

export function AddBoothForm({
  open,
  onOpenChange,
  onSubmit,
}: AddBoothFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Tambah booth baru</DialogTitle>
        </DialogHeader>
        <AddBoothFields onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  )
}
