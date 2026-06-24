"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  CATEGORY_ORDER,
  tools,
  toolsByCategory,
  type Tool,
} from "@/lib/tools";

export default function Home() {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => toolsByCategory(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return grouped;
    const matches = tools.filter((t) => {
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.slug.includes(q) ||
        t.keywords.some((k) => k.includes(q))
      );
    });
    const next = {
      Formatters: [] as Tool[],
      Encoders: [] as Tool[],
      Generators: [] as Tool[],
    Converters: [] as Tool[],
    };
    for (const t of matches) next[t.category].push(t);
    return next;
  }, [grouped, query]);

  const totalShown = Object.values(filtered).reduce(
    (acc, list) => acc + list.length,
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Developer tools, in your browser.
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-500">
          A focused set of utilities for formatting, encoding and generating —
          JSON, SQL, JWT, Base64 and more. Everything runs locally; nothing is
          sent anywhere.
        </p>

        <div className="mt-6 max-w-md">
          <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools…"
              className="h-full flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {totalShown === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
          No tools match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="space-y-10">
          {CATEGORY_ORDER.map((category) => {
            const list = filtered[category];
            if (list.length === 0) return null;
            return (
              <section key={category}>
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {category}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {list.length} tool{list.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h3 className="font-medium text-slate-900">{tool.name}</h3>
      </div>
      <p className="mt-2.5 text-[13px] leading-relaxed text-slate-500">
        {tool.description}
      </p>
      <span className="mt-3 text-xs font-medium text-slate-400 transition-colors group-hover:text-slate-900">
        Open →
      </span>
    </Link>
  );
}
