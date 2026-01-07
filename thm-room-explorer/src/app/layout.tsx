import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "THM Room Explorer",
  description: "TryHackMe Room Explorer + Admin Scraper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-dvh bg-[#070A10] text-zinc-100">
          <header className="border-b border-zinc-900 bg-black/30 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-100">
                THM Room Explorer
              </Link>
              <nav className="flex gap-4 text-sm text-zinc-300">
                <Link href="/rooms" className="hover:text-zinc-100">
                  Rooms
                </Link>
                <Link href="/admin" className="hover:text-zinc-100">
                  Admin
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
