"use client";

import { useState } from "react";
import { ulid } from "ulid";
import { CopyButton } from "@/components/CopyButton";
import { Button, Label, Select } from "@/components/ui";

type Kind = "uuidv4" | "ulid";

// RFC4122 v4 using Web Crypto
function uuidv4(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `${h(b[0])}${h(b[1])}${h(b[2])}${h(b[3])}-${h(b[4])}${h(b[5])}-${
    h(b[6])
  }${h(b[7])}-${h(b[8])}${h(b[9])}-${h(b[10])}${h(b[11])}${h(b[12])}${
    h(b[13])
  }${h(b[14])}${h(b[15])}`;
}

export function UuidGenerator() {
  const [kind, setKind] = useState<Kind>("uuidv4");
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [items, setItems] = useState<string[]>([]);

  function generate() {
    const make = () =>
      kind === "uuidv4" ? uuidv4() : ulid();
    const n = Math.max(1, Math.min(100, count));
    const list = Array.from({ length: n }, make);
    setItems(list);
  }

  const formatted = items
    .map((i) => {
      let v = i;
      if (uppercase) v = v.toUpperCase();
      if (!hyphens) v = v.replaceAll("-", "");
      return v;
    })
    .join("\n");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>Format</Label>
          <Select
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
            className="w-40"
          >
            <option value="uuidv4">UUID v4</option>
            <option value="ulid">ULID</option>
          </Select>
        </div>
        <div>
          <Label>Count</Label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 1)}
            className="h-10 w-24 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <label className="flex h-10 cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-slate-900"
          />
          Uppercase
        </label>
        <label className="flex h-10 cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={hyphens}
            onChange={(e) => setHyphens(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-slate-900"
          />
          Hyphens
        </label>
        <Button variant="primary" onClick={generate}>
          Generate
        </Button>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label className="mb-0">Result</Label>
          <CopyButton value={formatted} disabled={items.length === 0} />
        </div>
        <pre className="min-h-[200px] overflow-auto rounded-lg border border-slate-200 bg-white p-3 font-mono text-[13px] leading-relaxed text-slate-900">
          {formatted || "Click Generate to create identifiers."}
        </pre>
        {items.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            {items.length} {items.length === 1 ? "item" : "items"} generated.
          </p>
        )}
      </div>
    </div>
  );
}
