import { MapPinIcon } from "lucide-react";

interface BranchLocationBadgeProps {
  boothName: string;
  branch: string;
}

export default function BranchLocationBadge({
  boothName,
  branch,
}: BranchLocationBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 font-medium text-foreground">
      <MapPinIcon aria-hidden className="size-5 text-accent" />
      {boothName}, {branch}
    </span>
  );
}
