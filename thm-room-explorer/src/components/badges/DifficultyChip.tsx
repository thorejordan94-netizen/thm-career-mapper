import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/ui/cn";

function difficultyClass(difficulty: string) {
  const d = difficulty.toLowerCase();
  if (d.includes("easy")) return "border-emerald-900/60 bg-emerald-950/30 text-emerald-200";
  if (d.includes("medium")) return "border-amber-900/60 bg-amber-950/30 text-amber-200";
  if (d.includes("hard")) return "border-rose-900/60 bg-rose-950/30 text-rose-200";
  if (d.includes("insane")) return "border-fuchsia-900/60 bg-fuchsia-950/30 text-fuchsia-200";
  return "border-zinc-800 bg-zinc-950 text-zinc-200";
}

export function DifficultyChip({ difficulty }: { difficulty: string }) {
  return <Badge className={cn("rounded-[14px] border", difficultyClass(difficulty))}>{difficulty}</Badge>;
}

