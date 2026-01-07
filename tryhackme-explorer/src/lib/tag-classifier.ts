import { TagType } from '@prisma/client';

// Synonym mapping for canonicalization
const SYNONYM_MAP: Record<string, string> = {
  privesc: 'privilege_escalation',
  priv_esc: 'privilege_escalation',
  'privilege escalation': 'privilege_escalation',
  elk: 'elastic_stack',
  'elastic stack': 'elastic_stack',
  ad: 'active_directory',
  'active directory': 'active_directory',
  recon: 'reconnaissance',
  lm: 'lateral_movement',
  'lateral movement': 'lateral_movement',
  'defense evasion': 'defense_evasion',
  'av evasion': 'av_evasion',
  'credential access': 'credential_access',
  'data exfiltration': 'data_exfiltration',
  exfil: 'data_exfiltration',
  c2: 'command_and_control',
  'command and control': 'command_and_control',
};

// Domain keywords
const DOMAIN_KEYWORDS: Record<string, string> = {
  web: 'web_exploitation',
  'active directory': 'active_directory',
  windows: 'windows_offense',
  linux: 'linux_offense',
  cloud: 'cloud_exploitation',
  dfir: 'dfir',
  forensics: 'dfir',
  soc: 'soc_detection',
  detection: 'soc_detection',
  malware: 'malware_re',
  're': 'malware_re',
  'reverse engineering': 'malware_re',
  binary: 'binary_exploitation',
  pwn: 'binary_exploitation',
  network: 'networking',
  networking: 'networking',
  osint: 'osint',
  crypto: 'cryptography',
  cryptography: 'cryptography',
  steganography: 'cryptography',
  ai: 'ai_security',
  ot: 'ot_ics',
  ics: 'ot_ics',
  scada: 'ot_ics',
  ctf: 'ctf_challenges',
};

// Tactic keywords (MITRE ATT&CK-inspired)
const TACTIC_KEYWORDS = [
  'reconnaissance',
  'initial_access',
  'execution',
  'persistence',
  'privilege_escalation',
  'defense_evasion',
  'credential_access',
  'discovery',
  'lateral_movement',
  'collection',
  'command_and_control',
  'exfiltration',
  'impact',
];

// Tool keywords
const TOOL_KEYWORDS = [
  'burp_suite',
  'nmap',
  'metasploit',
  'wireshark',
  'splunk',
  'kibana',
  'elastic_stack',
  'volatility',
  'ghidra',
  'ida',
  'radare2',
  'mimikatz',
  'bloodhound',
  'impacket',
  'powershell',
  'python',
  'ansible',
  'terraform',
  'kubernetes',
  'docker',
];

// Platform keywords
const PLATFORM_KEYWORDS = [
  'windows',
  'linux',
  'aws',
  'azure',
  'gcp',
  'kubernetes',
  'docker',
  'iot',
  'android',
  'ios',
];

/**
 * Canonicalize a tag: lowercase, snake_case, synonym mapping
 */
export function canonicalizeTag(tag: string): string {
  let canonical = tag.toLowerCase().trim();

  // Replace spaces and hyphens with underscores
  canonical = canonical.replace(/[\s\-]+/g, '_');

  // Remove special characters
  canonical = canonical.replace(/[^a-z0-9_]/g, '');

  // Apply synonym mapping
  if (SYNONYM_MAP[canonical]) {
    canonical = SYNONYM_MAP[canonical];
  }

  return canonical;
}

/**
 * Two-pass routing: Determine tag type
 */
export function classifyTagType(canonical: string): TagType {
  // Pass 1: Deterministic typing

  // CVE pattern -> Artifact/Vulnerability
  if (/^cve[-_]\d{4}[-_]\d+/.test(canonical)) {
    return 'ARTIFACT_INDICATOR';
  }

  // Tactic check
  if (TACTIC_KEYWORDS.includes(canonical)) {
    return 'TACTIC';
  }

  // Tool check
  if (TOOL_KEYWORDS.some((tool) => canonical.includes(tool))) {
    return 'TOOL_STACK';
  }

  // Platform check
  if (PLATFORM_KEYWORDS.some((platform) => canonical === platform)) {
    return 'PLATFORM_ENVIRONMENT';
  }

  // Domain check
  for (const [keyword, domain] of Object.entries(DOMAIN_KEYWORDS)) {
    if (canonical.includes(keyword.replace(/\s/g, '_'))) {
      return 'DOMAIN';
    }
  }

  // File/data artifact patterns
  if (
    canonical.includes('pcap') ||
    canonical.includes('dump') ||
    canonical.includes('log') ||
    canonical.includes('event')
  ) {
    return 'ARTIFACT_INDICATOR';
  }

  // Default to TECHNIQUE if no match
  return 'TECHNIQUE';
}

/**
 * Determine primary cluster based on type and canonical name
 */
export function determinePrimaryCluster(
  canonical: string,
  type: TagType
): string {
  if (type === 'DOMAIN') {
    for (const [keyword, domain] of Object.entries(DOMAIN_KEYWORDS)) {
      if (canonical.includes(keyword.replace(/\s/g, '_'))) {
        return domain;
      }
    }
    return canonical;
  }

  if (type === 'TACTIC' && TACTIC_KEYWORDS.includes(canonical)) {
    return canonical;
  }

  if (type === 'PLATFORM_ENVIRONMENT') {
    return canonical;
  }

  if (type === 'TOOL_STACK') {
    return canonical;
  }

  // For techniques, use the canonical name as cluster
  return canonical;
}

/**
 * Generate display name from canonical name
 */
export function generateDisplayName(canonical: string): string {
  return canonical
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Process a raw tag string into structured tag data
 */
export function processTag(rawTag: string) {
  const canonical = canonicalizeTag(rawTag);
  const type = classifyTagType(canonical);
  const primaryCluster = determinePrimaryCluster(canonical, type);
  const displayName = generateDisplayName(canonical);

  return {
    nameCanonical: canonical,
    displayName,
    type,
    primaryCluster,
    confidence: 0.85, // Heuristic-based confidence
  };
}
