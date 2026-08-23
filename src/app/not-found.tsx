import Link from "next/link"

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><p className="text-5xl font-black text-indigo-600">404</p><h1 className="mt-3 text-2xl font-bold text-slate-900">Page not found</h1><p className="mt-2 text-sm text-slate-500">The page you requested does not exist or is no longer available.</p><Link href="/dashboard" className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Return to dashboard</Link></section></main>
}
