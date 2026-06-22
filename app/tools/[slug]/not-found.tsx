import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ToolNotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        That tool doesn&rsquo;t exist.
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        It may have been renamed or removed.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all tools
      </Link>
    </div>
  );
}
