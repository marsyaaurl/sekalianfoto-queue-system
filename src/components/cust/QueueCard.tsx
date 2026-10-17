import type { ReactNode } from "react";

// Shown while the API does not provide a value yet.
const EMPTY_VALUE = "–";
const WAITING_HINT = "Jalan-jalan dulu, nanti kami kabari.";

interface QueueCardProps {
  queueNumber: string;
  peopleAhead?: number;
  estimatedMinutes?: number;
  badge?: ReactNode;
}

// The notches are clipped by the ticket's overflow-hidden, so only the inner half shows.
function TicketDivider() {
  return (
    <div className="relative h-6" aria-hidden>
      <span className="absolute top-0 left-0 size-6 -translate-x-1/2 rounded-full border bg-background" />
      <span className="absolute top-0 right-0 size-6 translate-x-1/2 rounded-full border bg-background" />
      <div className="absolute inset-x-6 top-1/2 border-t border-dashed" />
    </div>
  );
}

interface StatTileProps {
  label: string;
  value?: string;
  unit: string;
}

function StatTile({ label, value, unit }: StatTileProps) {
  return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 whitespace-nowrap">
        <span className="text-3xl font-bold text-foreground">
          {value ?? EMPTY_VALUE}
        </span>
        {value !== undefined && (
          <span className="ml-1.5 text-base text-muted-foreground">{unit}</span>
        )}
      </p>
    </div>
  );
}

export default function QueueCard({
  queueNumber,
  peopleAhead,
  estimatedMinutes,
  badge,
}: QueueCardProps) {
  const peopleAheadValue =
    peopleAhead === undefined ? undefined : String(peopleAhead);
  const estimatedValue =
    estimatedMinutes === undefined ? undefined : `~${estimatedMinutes}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
          <p className="text-muted-foreground">Nomor antreanmu</p>
          <p className="mt-3 text-7xl font-extrabold tabular-nums text-accent">
            {queueNumber}
          </p>
        </div>
        <TicketDivider />
        <div className="flex flex-col items-center gap-3 px-6 pt-5 pb-8 text-center">
          {badge}
          <p className="text-muted-foreground">{WAITING_HINT}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x rounded-2xl border bg-card">
        <StatTile label="Di depanmu" value={peopleAheadValue} unit="orang" />
        <StatTile label="Estimasi tunggu" value={estimatedValue} unit="menit" />
      </div>
    </div>
  );
}