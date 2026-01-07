const synonymMap: Record<string, string> = {
  privesc: "privilege_escalation",
  elk: "elastic_stack",
  ad: "active_directory",
  win: "windows",
};

export function toSnakeCase(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/__+/g, "_");
}

export function canonicalizeTag(input: string) {
  const normalized = toSnakeCase(input);
  return synonymMap[normalized] ?? normalized;
}

