import { Badge } from "@/components/ui/Badge";
import { domainPalette, type DomainKey } from "@/lib/tagging/domainPalette";
import {
  Binary,
  BrainCircuit,
  Bug,
  Cloud,
  Cpu,
  Factory,
  Flag,
  Monitor,
  Network,
  Radar,
  Router,
  Search,
  Shield,
  ShieldCheck,
  Terminal,
} from "lucide-react";

const iconMap = {
  bug: Bug,
  network: Network,
  monitor: Monitor,
  terminal: Terminal,
  cloud: Cloud,
  search: Search,
  "shield-check": ShieldCheck,
  binary: Binary,
  cpu: Cpu,
  router: Router,
  radar: Radar,
  "key-round": Shield,
  "brain-circuit": BrainCircuit,
  factory: Factory,
  shield: Shield,
  flag: Flag,
} as const;

export function DomainBadge({ domain }: { domain: DomainKey }) {
  const tokens = domainPalette[domain];
  const Icon = iconMap[tokens.icon as keyof typeof iconMap] ?? Shield;

  return (
    <Badge
      className="border-transparent"
      style={{ backgroundColor: tokens.bg, color: tokens.ink }}
    >
      <Icon size={14} style={{ color: tokens.ink }} />
      {tokens.label}
    </Badge>
  );
}

