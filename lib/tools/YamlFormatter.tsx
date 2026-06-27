"use client";

import { useMemo, useState } from "react";
import yaml from "js-yaml";
import { CopyButton } from "@/components/CopyButton";
import { Button, Label, Select, Textarea } from "@/components/ui";

type Mode = "format" | "toJson" | "fromJson";

export function YamlFormatter() {
  const [input, setInput] = useState(
    "name: DevTools\nstack:\n  - Next.js\n  - TypeScript\nsettings:\n  dark: false\n  limit: 100\n",
  );
  const [mode, setMode] = useState<Mode>("format");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      if (mode === "fromJson") {
        // input is JSON
        const parsed = JSON.parse(input);
        return { output: yaml.dump(parsed, { indent: 2 }), error: "" };
      }
      // input is YAML
      const parsed = yaml.load(input);
      if (mode === "toJson") {
        return { output: JSON.stringify(parsed, null, 2), error: "" };
      }
      return { output: yaml.dump(parsed, { indent: 2 }), error: "" };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : String(e) };
    }
  }, [input, mode]);

  const inputLabel =
    mode === "fromJson" ? "JSON input" : "YAML input";
  const outputLabel =
    mode === "toJson" ? "JSON" : "YAML";

  return (
    <div className="space-y-4">
      <div>
        <Label>Mode</Label>
        <Select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="w-56"
        >
          <option value="format">Format / validate YAML</option>
          <option value="toJson">YAML → JSON</option>
          <option value="fromJson">JSON → YAML</option>
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label>{inputLabel}</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[400px]"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">{outputLabel}</Label>
            <CopyButton value={output} disabled={!!error} />
          </div>
          <Textarea
            readOnly
            value={error ? "" : output}
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

      <Button variant="ghost" size="sm" onClick={() => setInput("")}>
        Clear
      </Button>
    </div>
  );
}
