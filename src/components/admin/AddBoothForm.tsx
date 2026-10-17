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

export type AddBoothFormMode = "create" | "edit"

export interface AddBoothFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AddBoothFormValues) => void
  mode?: AddBoothFormMode
  initialValues?: AddBoothFormValues
  isSubmitting?: boolean
  errorMessage?: string | null
}

const NAME_REQUIRED_ERROR = "Nama booth wajib diisi."
const EMPTY_VALUES: AddBoothFormValues = { name: "", branch: "" }

// The edit copy is a placeholder: no design exists for it yet.
const MODE_COPY: Record<
  AddBoothFormMode,
  { title: string; submitLabel: string }
> = {
  create: { title: "Tambah booth baru", submitLabel: "Simpan booth" },
  edit: { title: "Edit booth", submitLabel: "Simpan perubahan" },
}
const LABEL_CLASS = "text-base font-semibold"
const INPUT_CLASS = "h-11 bg-card px-3"

function getNameError(name: string): string | null {
  return name.trim() === "" ? NAME_REQUIRED_ERROR : null
}

interface AddBoothFieldsProps {
  onSubmit: (values: AddBoothFormValues) => void
  initialValues: AddBoothFormValues
  submitLabel: string
  isSubmitting: boolean
  errorMessage: string | null
}

// Lives inside DialogContent, which unmounts on close, so the form resets itself.
function AddBoothFields({
  onSubmit,
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
}: AddBoothFieldsProps) {
  const [name, setName] = useState(initialValues.name)
  const [branch, setBranch] = useState(initialValues.branch)
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
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
      <DialogFooter>
        <DialogClose
          render={
            <Button type="button" variant="outline" disabled={isSubmitting} />
          }
        >
          Batal
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function AddBoothForm({
  open,
  onOpenChange,
  onSubmit,
  mode = "create",
  initialValues = EMPTY_VALUES,
  isSubmitting = false,
  errorMessage = null,
}: AddBoothFormProps) {
  const { title, submitLabel } = MODE_COPY[mode]

  // Keep the dialog open while the request is running.
  function handleOpenChange(nextOpen: boolean) {
    if (!isSubmitting) onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
        </DialogHeader>
        <AddBoothFields
          onSubmit={onSubmit}
          initialValues={initialValues}
          submitLabel={submitLabel}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      </DialogContent>
    </Dialog>
  )
}
