import {
  CheckCheckIcon,
  CircleCheckIcon,
  CircleXIcon,
  HourglassIcon,
  TimerResetIcon,
  type LucideIcon,
} from "lucide-react";

export type QueueStatus =
  | "waiting"
  | "in_turn"
  | "done"
  | "extended"
  | "canceled";

interface StatusStyle {
  label: string;
  icon: LucideIcon;
  className: string;
}

// Every status pairs its colour with an icon so it never relies on colour alone.
const STATUS_STYLES: Record<QueueStatus, StatusStyle> = {
  waiting: {
    label: "Menunggu",
    icon: HourglassIcon,
    className: "bg-secondary text-foreground",
  },
  in_turn: {
    label: "Giliranmu",
    icon: CircleCheckIcon,
    className: "bg-success-light text-success-dark",
  },
  extended: {
    label: "Diperpanjang",
    icon: TimerResetIcon,
    className: "bg-warning-light text-warning-darker border border-warning-dark",
  },
  done: {
    label: "Selesai",
    icon: CheckCheckIcon,
    className: "bg-success-light text-success-dark",
  },
  canceled: {
    label: "Dibatalkan",
    icon: CircleXIcon,
    className: "bg-error-light text-error-dark",
  },
};

interface QueueStatusBadgeProps {
  status: QueueStatus;
}

export default function QueueStatusBadge({ status }: QueueStatusBadgeProps) {
  const { label, icon: Icon, className } = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-semibold ${className}`}
    >
      <Icon aria-hidden className="size-5" />
      {label}
    </span>
  );
}
