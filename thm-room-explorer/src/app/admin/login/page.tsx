import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-16">
      <h1 className="text-2xl font-semibold text-zinc-100">Admin Sign-in</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Use the seeded admin credentials from your environment.
      </p>

      <form
        className="mt-8 space-y-4 rounded-xl border border-zinc-900 bg-zinc-950/50 p-6"
        action="/api/auth/callback/credentials"
        method="post"
      >
        <div>
          <label className="text-xs font-medium text-zinc-400">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-2 h-10 w-full rounded-lg border border-zinc-800 bg-black/40 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-700"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-400">Password</label>
          <input
            name="password"
            type="password"
            required
            className="mt-2 h-10 w-full rounded-lg border border-zinc-800 bg-black/40 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-700"
          />
        </div>
        <button
          type="submit"
          className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-100 hover:bg-zinc-800"
        >
          Sign in
        </button>
        <div className="text-center text-xs text-zinc-500">
          <Link className="hover:text-zinc-300" href="/">
            Back to dashboard
          </Link>
        </div>
      </form>
    </main>
  );
}

