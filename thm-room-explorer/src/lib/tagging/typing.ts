import type { TagType } from "@/generated/prisma";
import { canonicalizeTag } from "@/lib/tagging/canonicalize";

const tactics = new Set([
  "reconnaissance",
  "initial_access",
  "privilege_escalation",
  "lateral_movement",
  "defense_evasion",
  "credential_access",
  "persistence",
  "exfiltration",
]);

const toolAnchors = [
  "splunk",
  "kibana",
  "elk",
  "wazuh",
  "osquery",
  "sysmon",
  "burp",
  "nmap",
  "wireshark",
  "ghidra",
  "volatility",
  "yara",
];

const platformAnchors = [
  "windows",
  "linux",
  "aws",
  "azure",
  "gcp",
  "kubernetes",
  "docker",
  "iot",
  "ics",
  "ot",
];

const domainAnchors: Array<[string, string[]]> = [
  ["active_directory", ["active_directory", "kerberos", "adcs", "gpo", "domain_controller"]],
  ["web_exploitation", ["web", "xss", "sql_injection", "sqli", "ssrf", "csrf", "ssti", "xxe"]],
  ["dfir", ["dfir", "forensics", "incident", "triage", "pcap", "memory_dump", "event_logs"]],
  ["malware_re", ["malware", "reverse_engineering", "re", "pe_header", "shellcode"]],
  ["binary_exploitation", ["pwn", "rop", "buffer_overflow", "heap"]],
  ["cloud_exploitation", ["cloud", "aws", "azure", "iam", "s3", "lambda"]],
  ["soc_detection", ["soc", "detection", "siem", "sigma", "kql", "splunk"]],
  ["networking", ["network", "dns", "dhcp", "routing", "firewall", "tcp"]],
  ["crypto_stego", ["crypto", "cryptography", "stego", "hash"]],
  ["osint", ["osint", "phishing", "social", "dorking"]],
  ["ai_security", ["llm", "prompt_injection", "ai", "ml"]],
  ["ot_ics", ["ics", "ot", "scada", "plc"]],
  ["security_engineering", ["hardening", "logging", "monitoring", "security_engineering"]],
  ["ctf", ["ctf", "challenge"]],
];

export function inferTagType(raw: string): { type: TagType; primaryCluster?: string; confidence: number } {
  const tag = canonicalizeTag(raw);
  if (/^cve_\d{4}_\d+/.test(tag) || /^cve-\d{4}-\d+/.test(raw.toLowerCase())) {
    return { type: "Artifact", primaryCluster: "vulnerability", confidence: 0.9 };
  }
  if (tactics.has(tag)) return { type: "Tactic", primaryCluster: tag, confidence: 0.95 };
  if (platformAnchors.some((a) => tag.includes(a))) return { type: "Platform", primaryCluster: tag, confidence: 0.75 };
  if (toolAnchors.some((a) => tag.includes(a))) return { type: "Tool", primaryCluster: tag, confidence: 0.75 };

  for (const [domain, anchors] of domainAnchors) {
    if (anchors.some((a) => tag.includes(a))) {
      return { type: "Domain", primaryCluster: domain, confidence: 0.65 };
    }
  }

  if (tag.length > 0) return { type: "Technique", primaryCluster: tag, confidence: 0.4 };
  return { type: "Technique", confidence: 0.0 };
}

