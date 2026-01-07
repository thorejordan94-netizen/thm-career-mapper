import { Badge } from "@/components/ui/Badge";

export function ToolChip({ label }: { label: string }) {
  return (
    <Badge className="rounded-[10px] border-zinc-800 bg-zinc-950 text-zinc-200">
      {label}
    </Badge>
  );
}

