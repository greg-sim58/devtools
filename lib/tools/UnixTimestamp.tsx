"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Button, Input, Label } from "@/components/ui";

type Unit = "s" | "ms";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDate(d: Date) {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    ` ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

export function UnixTimestamp() {
  const [now, setNow] = useState(() => Date.now());
  const [unit, setUnit] = useState<Unit>("s");
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const tsResult = (() => {
    if (!tsInput.trim()) return { value: "", error: "" };
    const n = Number(tsInput);
    if (!Number.isFinite(n)) return { value: "", error: "Not a number" };
    const ms = unit === "s" ? n * 1000 : n;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return { value: "", error: "Invalid date" };
    return { value: `${d.toISOString()}\n${formatDate(d)} (local)`, error: "" };
  })();

  const dateResult = (() => {
    if (!dateInput.trim()) return { value: "", error: "" };
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime()))
      return { value: "", error: "Could not parse date" };
    const ms = d.getTime();
    return {
      value: unit === "s" ? Math.floor(ms / 1000).toString() : ms.toString(),
      error: "",
    };
  })();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <Label>Current Unix time</Label>
        <div className="flex items-center gap-3">
          <code className="font-mono text-2xl font-semibold text-slate-900">
            {unit === "s" ? Math.floor(now / 1000) : now}
          </code>
          <span className="text-sm text-slate-400">{unit}</span>
          <CopyButton
            value={(unit === "s" ? Math.floor(now / 1000) : now).toString()}
          />
          <div className="ml-auto inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {(["s", "ms"] as Unit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  unit === u
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {u === "s" ? "Seconds" : "Millis"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <Label>Timestamp → Date</Label>
          <Input
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            placeholder="1700000000"
          />
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="mb-0">Date</Label>
              <CopyButton value={tsResult.value} disabled={!!tsResult.error} />
            </div>
            {tsResult.error ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                {tsResult.error}
              </p>
            ) : (
              <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[13px] text-slate-900">
                {tsResult.value || "—"}
              </pre>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <Label>Date → Timestamp</Label>
          <Input
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            placeholder="2024-01-15 12:30:00"
          />
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="mb-0">Timestamp ({unit})</Label>
              <CopyButton
                value={dateResult.value}
                disabled={!!dateResult.error}
              />
            </div>
            {dateResult.error ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                {dateResult.error}
              </p>
            ) : (
              <pre className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[13px] text-slate-900">
                {dateResult.value || "—"}
              </pre>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setDateInput(
                  `${formatDate(new Date())}`,
                )
              }
            >
              Use current
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTsInput("");
                setDateInput("");
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
