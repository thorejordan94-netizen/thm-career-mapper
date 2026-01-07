import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Domain color palette from specification
        domain: {
          web: { bg: '#6D28D9', border: '#4C1D95', ink: '#FFFFFF' },
          ad: { bg: '#B91C1C', border: '#7F1D1D', ink: '#FFFFFF' },
          'windows-offense': { bg: '#DC2626', border: '#991B1B', ink: '#FFFFFF' },
          'linux-offense': { bg: '#F97316', border: '#C2410C', ink: '#111827' },
          cloud: { bg: '#0EA5E9', border: '#0369A1', ink: '#0B1220' },
          dfir: { bg: '#2563EB', border: '#1E40AF', ink: '#FFFFFF' },
          soc: { bg: '#16A34A', border: '#166534', ink: '#0B1220' },
          malware: { bg: '#111827', border: '#374151', ink: '#FFFFFF' },
          'bin-exploit': { bg: '#6B7280', border: '#374151', ink: '#FFFFFF' },
          networking: { bg: '#14B8A6', border: '#0F766E', ink: '#0B1220' },
          osint: { bg: '#A16207', border: '#713F12', ink: '#FFFFFF' },
          crypto: { bg: '#9333EA', border: '#5B21B6', ink: '#FFFFFF' },
          ai: { bg: '#EC4899', border: '#9D174D', ink: '#0B1220' },
          ot: { bg: '#F59E0B', border: '#B45309', ink: '#0B1220' },
          'sec-eng': { bg: '#22C55E', border: '#15803D', ink: '#0B1220' },
          ctf: { bg: '#8B5CF6', border: '#5B21B6', ink: '#FFFFFF' },
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
