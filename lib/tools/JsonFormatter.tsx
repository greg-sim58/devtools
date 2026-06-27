"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Button, Label, Select, Textarea } from "@/components/ui";

type Indent = "2" | "4" | "tab";

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<Indent>("2");
  const [minify, setMinify] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const parsed = JSON.parse(input);
      const indentStr = indent === "tab" ? "\t" : Number(indent);
      const formatted = JSON.stringify(
        parsed,
        null,
        minify ? 0 : indentStr,
      );
      return { output: formatted, error: "" };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { output: "", error: message };
    }
  }, [input, indent, minify]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>Indent</Label>
          <Select
            value={indent}
            onChange={(e) => setIndent(e.target.value as Indent)}
            className="w-32"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </Select>
        </div>
        <div>
          <Label>Mode</Label>
          <div className="flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setMinify(false)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                !minify
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Beautify
            </button>
            <button
              type="button"
              onClick={() => setMinify(true)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                minify
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Minify
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label>Input</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"hello":"world","items":[1,2,3]}'
            className="min-h-[400px]"
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
            placeholder={
              error ? "" : "Formatted JSON will appear here."
            }
            className={`min-h-[400px] ${
              error
                ? "border-red-300 bg-red-50/40 text-red-700"
                : ""
            }`}
          />
          {error && (
            <p className="mt-2 break-words rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              <span className="font-semibold">Invalid JSON: </span>
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInput(EXAMPLE)}
        >
          Load example
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInput("")}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

const EXAMPLE = JSON.stringify(
  {
    name: "Ada Lovelace",
    born: 1815,
    fields: ["mathematics", "computing"],
    active: true,
    notes: null,
  },
  null,
  0,
);
