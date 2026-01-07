import { Badge } from "@/components/ui/Badge";

export function ArtifactChip({ label }: { label: string }) {
  return <Badge className="rounded-md border-zinc-800 bg-zinc-950 text-zinc-200">{label}</Badge>;
}

