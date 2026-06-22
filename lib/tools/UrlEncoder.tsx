"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Label, Textarea } from "@/components/ui";

type Mode = "encode" | "decode";
type Scope = "component" | "uri";

export function UrlEncoder() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [scope, setScope] = useState<Scope>("component");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      if (mode === "encode") {
        return {
          output:
            scope === "component"
              ? encodeURIComponent(input)
              : encodeURI(input),
          error: "",
        };
      } else {
        return {
          output:
            scope === "component"
              ? decodeURIComponent(input)
              : decodeURI(input),
          error: "",
        };
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { output: "", error: message };
    }
  }, [input, mode, scope]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>Direction</Label>
          <div className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {(["encode", "decode"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md px-4 py-1 text-xs font-medium capitalize transition-colors ${
                  mode === m
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Scope</Label>
          <div className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {(
              [
                ["component", "Component"],
                ["uri", "Full URI"],
              ] as [Scope, string][]
            ).map(([s, label]) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  scope === s
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label>Input</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/search?q=hello world&lang=en"
            className="min-h-[320px]"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">Output</Label>
            <CopyButton value={output} disabled={!!error} />
          </div>
          <Textarea
            readOnly
            value={error ? "" : output}
            placeholder={error ? "" : "Result will appear here."}
            className={`min-h-[320px] ${
              error ? "border-red-300 bg-red-50/40 text-red-700" : ""
            }`}
          />
          {error && (
            <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              <span className="font-semibold">Error: </span>
              {error}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        <span className="font-medium">Component</span> escapes
        <code className="mx-1 rounded bg-slate-100 px-1 py-0.5">:/?&=+</code>
        and is right for query values. <span className="font-medium">Full URI</span>
        keeps <code className="mx-1 rounded bg-slate-100 px-1 py-0.5">:/?#</code>
        so a complete URL stays valid.
      </p>
    </div>
  );
}
