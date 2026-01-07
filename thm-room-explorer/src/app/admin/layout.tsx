import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions, isAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) redirect("/admin/login");

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-500">Admin</div>
          <h1 className="mt-1 text-xl font-semibold text-zinc-100">Control Panel</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/scraper"
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Scraper
          </Link>
          <Link
            href="/admin/rooms"
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Rooms
          </Link>
          <Link
            href="/api/auth/signout"
            className="rounded-lg border border-zinc-900 bg-transparent px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
          >
            Sign out
          </Link>
        </div>
      </div>

      <div className="mt-8">{children}</div>
    </main>
  );
}

