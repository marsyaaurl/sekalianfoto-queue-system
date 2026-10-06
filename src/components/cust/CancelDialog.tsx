"use client";

interface CancelDialogProps {
  open: boolean;
  queueNumber: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CancelDialog({
  open,
  queueNumber,
  onConfirm,
  onCancel,
  isLoading = false,
}: CancelDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-dialog-title"
        className="mx-auto w-full max-w-md rounded-2xl bg-white p-6"
      >
        <h2
          id="cancel-dialog-title"
          className="mb-3 text-2xl font-bold text-foreground"
        >
          Batalkan antrean?
        </h2>
        <p className="mb-6 text-foreground/70">
          Nomor {queueNumber} akan dihapus dan orang di belakangmu maju satu
          posisi. Kamu perlu daftar ulang kalau ingin antre lagi.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-12 w-full rounded-lg bg-error font-bold text-white disabled:opacity-50"
          >
            {isLoading ? "Membatalkan..." : "Ya, batalkan"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 w-full rounded-lg border border-foreground/30 bg-white font-bold text-foreground disabled:opacity-50"
          >
            Tetap Antre
          </button>
        </div>
      </div>
    </div>
  );
}