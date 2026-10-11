interface BranchLocationBadgeProps {
  boothName: string;
  branch: string;
}

export default function BranchLocationBadge({
  boothName,
  branch,
}: BranchLocationBadgeProps) {
  return (
    <span className="inline-block rounded-full border border-foreground/40 px-3 py-1 text-sm text-foreground">
      {boothName}, {branch}
    </span>
  );
}