import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Domain-specific colors from specification
        domain: {
          web: { bg: "#6D28D9", border: "#4C1D95", ink: "#FFFFFF" },
          ad: { bg: "#B91C1C", border: "#7F1D1D", ink: "#FFFFFF" },
          windows: { bg: "#DC2626", border: "#991B1B", ink: "#FFFFFF" },
          linux: { bg: "#F97316", border: "#C2410C", ink: "#111827" },
          cloud: { bg: "#0EA5E9", border: "#0369A1", ink: "#0B1220" },
          dfir: { bg: "#2563EB", border: "#1E40AF", ink: "#FFFFFF" },
          soc: { bg: "#16A34A", border: "#166534", ink: "#0B1220" },
          malware: { bg: "#111827", border: "#374151", ink: "#FFFFFF" },
          binary: { bg: "#6B7280", border: "#374151", ink: "#FFFFFF" },
          networking: { bg: "#14B8A6", border: "#0F766E", ink: "#0B1220" },
          osint: { bg: "#A16207", border: "#713F12", ink: "#FFFFFF" },
          crypto: { bg: "#9333EA", border: "#5B21B6", ink: "#FFFFFF" },
          ai: { bg: "#EC4899", border: "#9D174D", ink: "#0B1220" },
          ot: { bg: "#F59E0B", border: "#B45309", ink: "#0B1220" },
          security: { bg: "#22C55E", border: "#15803D", ink: "#0B1220" },
          ctf: { bg: "#8B5CF6", border: "#5B21B6", ink: "#FFFFFF" },
        },
        // Dark theme base colors
        dark: {
          bg: "#0B1220",
          surface: "#1E293B",
          border: "#334155",
          text: "#F8FAFC",
          muted: "#94A3B8",
        },
      },
    },
  },
  plugins: [],
};
export default config;
