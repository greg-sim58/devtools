import Link from "next/link";
import { Wrench } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Wrench className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            DevTools
          </span>
        </Link>
        <span className="text-xs text-slate-400">
          Fast, private, client-side
        </span>
      </div>
    </header>
  );
}
