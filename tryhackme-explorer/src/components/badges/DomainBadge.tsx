import React from 'react';
import * as LucideIcons from 'lucide-react';
import { TagType } from '@prisma/client';

// Domain color mapping from specification
const DOMAIN_COLORS: Record<string, { bg: string; border: string; ink: string; icon: keyof typeof LucideIcons }> = {
  web_exploitation: { bg: '#6D28D9', border: '#4C1D95', ink: '#FFFFFF', icon: 'Bug' },
  active_directory: { bg: '#B91C1C', border: '#7F1D1D', ink: '#FFFFFF', icon: 'Network' },
  windows_offense: { bg: '#DC2626', border: '#991B1B', ink: '#FFFFFF', icon: 'Monitor' },
  linux_offense: { bg: '#F97316', border: '#C2410C', ink: '#111827', icon: 'Terminal' },
  cloud_exploitation: { bg: '#0EA5E9', border: '#0369A1', ink: '#0B1220', icon: 'Cloud' },
  dfir: { bg: '#2563EB', border: '#1E40AF', ink: '#FFFFFF', icon: 'Search' },
  soc_detection: { bg: '#16A34A', border: '#166534', ink: '#0B1220', icon: 'ShieldCheck' },
  malware_re: { bg: '#111827', border: '#374151', ink: '#FFFFFF', icon: 'Binary' },
  binary_exploitation: { bg: '#6B7280', border: '#374151', ink: '#FFFFFF', icon: 'Cpu' },
  networking: { bg: '#14B8A6', border: '#0F766E', ink: '#0B1220', icon: 'Router' },
  osint: { bg: '#A16207', border: '#713F12', ink: '#FFFFFF', icon: 'Radar' },
  cryptography: { bg: '#9333EA', border: '#5B21B6', ink: '#FFFFFF', icon: 'KeyRound' },
  ai_security: { bg: '#EC4899', border: '#9D174D', ink: '#0B1220', icon: 'BrainCircuit' },
  ot_ics: { bg: '#F59E0B', border: '#B45309', ink: '#0B1220', icon: 'Factory' },
  sec_eng: { bg: '#22C55E', border: '#15803D', ink: '#0B1220', icon: 'Shield' },
  ctf_challenges: { bg: '#8B5CF6', border: '#5B21B6', ink: '#FFFFFF', icon: 'Flag' },
};

interface DomainBadgeProps {
  cluster: string;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
}

export function DomainBadge({ cluster, displayName, size = 'md' }: DomainBadgeProps) {
  const colors = DOMAIN_COLORS[cluster] || {
    bg: '#6B7280',
    border: '#374151',
    ink: '#FFFFFF',
    icon: 'Tag' as keyof typeof LucideIcons,
  };

  const Icon = LucideIcons[colors.icon] as React.ComponentType<{ className?: string }>;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.ink,
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      <span>{displayName}</span>
    </span>
  );
}

interface SecondaryChipProps {
  label: string;
  domainBorderColor?: string;
  icon?: keyof typeof LucideIcons;
}

export function SecondaryChip({ label, domainBorderColor = '#374151', icon }: SecondaryChipProps) {
  const Icon = icon ? (LucideIcons[icon] as React.ComponentType<{ className?: string }>) : null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-slate-900 text-slate-200"
      style={{
        borderColor: domainBorderColor,
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
}

interface ToolChipProps {
  name: string;
}

export function ToolChip({ name }: ToolChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
      <LucideIcons.Wrench className="w-3 h-3" />
      {name}
    </span>
  );
}

interface DifficultyChipProps {
  difficulty: string;
}

export function DifficultyChip({ difficulty }: DifficultyChipProps) {
  const colorMap: Record<string, string> = {
    Easy: 'bg-green-900 text-green-200 border-green-700',
    Medium: 'bg-yellow-900 text-yellow-200 border-yellow-700',
    Hard: 'bg-red-900 text-red-200 border-red-700',
    Insane: 'bg-purple-900 text-purple-200 border-purple-700',
  };

  const color = colorMap[difficulty] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded border ${color}`}>
      {difficulty}
    </span>
  );
}
