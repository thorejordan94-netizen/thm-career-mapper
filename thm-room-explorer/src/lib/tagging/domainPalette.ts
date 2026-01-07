export type DomainKey =
  | "web_exploitation"
  | "active_directory"
  | "windows_offense"
  | "linux_offense"
  | "cloud_exploitation"
  | "dfir"
  | "soc_detection"
  | "malware_re"
  | "binary_exploitation"
  | "networking"
  | "osint"
  | "crypto_stego"
  | "ai_security"
  | "ot_ics"
  | "security_engineering"
  | "ctf";

export type DomainTokens = {
  label: string;
  icon: string;
  bg: string;
  border: string;
  ink: string;
};

export const domainPalette: Record<DomainKey, DomainTokens> = {
  web_exploitation: {
    label: "Web Exploitation",
    icon: "bug",
    bg: "#6D28D9",
    border: "#4C1D95",
    ink: "#FFFFFF",
  },
  active_directory: {
    label: "Active Directory",
    icon: "network",
    bg: "#B91C1C",
    border: "#7F1D1D",
    ink: "#FFFFFF",
  },
  windows_offense: {
    label: "Windows Offense",
    icon: "monitor",
    bg: "#DC2626",
    border: "#991B1B",
    ink: "#FFFFFF",
  },
  linux_offense: {
    label: "Linux Offense",
    icon: "terminal",
    bg: "#F97316",
    border: "#C2410C",
    ink: "#111827",
  },
  cloud_exploitation: {
    label: "Cloud Exploitation",
    icon: "cloud",
    bg: "#0EA5E9",
    border: "#0369A1",
    ink: "#0B1220",
  },
  dfir: {
    label: "DFIR / Forensics",
    icon: "search",
    bg: "#2563EB",
    border: "#1E40AF",
    ink: "#FFFFFF",
  },
  soc_detection: {
    label: "SOC / Detection",
    icon: "shield-check",
    bg: "#16A34A",
    border: "#166534",
    ink: "#0B1220",
  },
  malware_re: {
    label: "Malware / RE",
    icon: "binary",
    bg: "#111827",
    border: "#374151",
    ink: "#FFFFFF",
  },
  binary_exploitation: {
    label: "Binary Exploitation",
    icon: "cpu",
    bg: "#6B7280",
    border: "#374151",
    ink: "#FFFFFF",
  },
  networking: {
    label: "Networking",
    icon: "router",
    bg: "#14B8A6",
    border: "#0F766E",
    ink: "#0B1220",
  },
  osint: {
    label: "OSINT / Social",
    icon: "radar",
    bg: "#A16207",
    border: "#713F12",
    ink: "#FFFFFF",
  },
  crypto_stego: {
    label: "Crypto / Stego",
    icon: "key-round",
    bg: "#9333EA",
    border: "#5B21B6",
    ink: "#FFFFFF",
  },
  ai_security: {
    label: "AI Security",
    icon: "brain-circuit",
    bg: "#EC4899",
    border: "#9D174D",
    ink: "#0B1220",
  },
  ot_ics: {
    label: "OT / ICS",
    icon: "factory",
    bg: "#F59E0B",
    border: "#B45309",
    ink: "#0B1220",
  },
  security_engineering: {
    label: "Security Engineering",
    icon: "shield",
    bg: "#22C55E",
    border: "#15803D",
    ink: "#0B1220",
  },
  ctf: {
    label: "CTF / Challenges",
    icon: "flag",
    bg: "#8B5CF6",
    border: "#5B21B6",
    ink: "#FFFFFF",
  },
};

