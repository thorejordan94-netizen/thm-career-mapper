import { Badge } from "@/components/ui/Badge";
import type { DomainKey } from "@/lib/tagging/domainPalette";
import { domainPalette } from "@/lib/tagging/domainPalette";
import { cn } from "@/lib/ui/cn";

export function SecondaryChip({
  domain,
  label,
  icon,
  className,
}: {
  domain: DomainKey;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const tokens = domainPalette[domain];

  return (
    <Badge
      className={cn("bg-[#0B1220] text-zinc-100", className)}
      style={{ borderColor: tokens.border }}
    >
      {icon}
      {label}
    </Badge>
  );
}

