"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Label, Textarea } from "@/components/ui";

type Mode = "encode" | "decode";

export function Base64() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      if (mode === "encode") {
        // Handle UTF-8 correctly
        const bytes = new TextEncoder().encode(input);
        let bin = "";
        bytes.forEach((b) => (bin += String.fromCharCode(b)));
        return { output: btoa(bin), error: "" };
      } else {
        const bin = atob(input.trim());
        const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
        return {
          output: new TextDecoder().decode(bytes),
          error: "",
        };
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { output: "", error: message };
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
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
              {m === "encode" ? "Encode →" : "← Decode"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label>{mode === "encode" ? "Plain text" : "Base64"}</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Type text to encode…"
                : "Paste Base64 to decode…"
            }
            className="min-h-[400px]"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">
              {mode === "encode" ? "Base64" : "Plain text"}
            </Label>
            <CopyButton value={output} disabled={!!error} />
          </div>
          <Textarea
            readOnly
            value={error ? "" : output}
            placeholder={
              error ? "" : "Result will appear here."
            }
            className={`min-h-[400px] ${
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
    </div>
  );
}
