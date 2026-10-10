import type { ReactNode } from "react";

interface QueueCardProps {
  queueNumber: string;
  peopleAhead: number;
  estimatedMinutes: number;
  badge?: ReactNode;
}

export default function QueueCard({
  queueNumber,
  peopleAhead,
  estimatedMinutes,
  badge,
}: QueueCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center rounded-2xl border border-foreground/20 bg-white px-6 py-8 text-center">
        <p className="text-foreground/70">Nomor antreanmu</p>
        <p className="my-3 text-6xl font-bold text-accent">{queueNumber}</p>
        {badge}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-foreground/20 bg-white p-4">
          <p className="text-sm text-foreground/70">Di depanmu</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {peopleAhead} orang
          </p>
        </div>

        <div className="rounded-xl border border-foreground/20 bg-white p-4">
          <p className="text-sm text-foreground/70">Estimasi tunggu</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            ~ {estimatedMinutes} menit
          </p>
        </div>
      </div>
    </div>
  );
}