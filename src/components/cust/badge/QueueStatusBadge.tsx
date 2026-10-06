export type QueueStatus =
  | "waiting"
  | "in_turn"
  | "done"
  | "extended"
  | "canceled";

const STATUS_STYLES: Record<QueueStatus, { label: string; className: string }> = {
  waiting: {
    label: "Menunggu",
    className: "bg-accent/15 text-foreground",
  },
  in_turn: {
    label: "Giliranmu",
    className: "bg-success-light text-success-dark",
  },
  extended: {
    label: "Diperpanjang",
    className: "bg-warning-light text-warning-dark border border-warning-dark",
  },
  done: {
    label: "Selesai",
    className: "bg-foreground/10 text-foreground/70",
  },
  canceled: {
    label: "Dibatalkan",
    className: "bg-error-light text-error-dark",
  },
};

interface QueueStatusBadgeProps {
  status: QueueStatus;
}

export default function QueueStatusBadge({ status }: QueueStatusBadgeProps) {
  const { label, className } = STATUS_STYLES[status];

  return (
    <span
      className={`inline-block rounded-full px-5 py-2 font-semibold ${className}`}
    >
      {label}
    </span>
  );
}