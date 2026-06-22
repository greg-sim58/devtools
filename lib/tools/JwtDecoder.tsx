"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Label, Textarea } from "@/components/ui";

type Segment = {
  name: string;
  json: string;
  error?: string;
};

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 ? "=".repeat(4 - (padded.length % 4)) : "";
  const bin = atob(padded + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseSegment(raw: string, name: string): Segment {
  if (!raw) return { name, json: "" };
  try {
    const decoded = base64UrlDecode(raw);
    const parsed = JSON.parse(decoded);
    return { name, json: JSON.stringify(parsed, null, 2) };
  } catch (e) {
    return {
      name,
      json: "",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export function JwtDecoder() {
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    const token = input.trim();
    if (!token) return null;

    const parts = token.split(".");
    const header = parseSegment(parts[0] ?? "", "Header");
    const payload = parseSegment(parts[1] ?? "", "Payload");
    const signature = parts[2] ?? "";

    let claims: Record<string, unknown> | null = null;
    if (payload.json) {
      try {
        claims = JSON.parse(payload.json);
      } catch {
        claims = null;
      }
    }

    const now = Math.floor(Date.now() / 1000);
    const statuses: { label: string; value: string; tone: string }[] = [];
    if (claims) {
      if (typeof claims.exp === "number") {
        const expired = claims.exp < now;
        statuses.push({
          label: "exp",
          value: `${new Date(claims.exp * 1000).toISOString()} (${
            expired ? "expired" : "valid"
          })`,
          tone: expired ? "red" : "green",
        });
      }
      if (typeof claims.nbf === "number") {
        const before = claims.nbf > now;
        statuses.push({
          label: "nbf",
          value: `${new Date(claims.nbf * 1000).toISOString()} (${
            before ? "not yet valid" : "valid"
          })`,
          tone: before ? "amber" : "green",
        });
      }
      if (typeof claims.iat === "number") {
        statuses.push({
          label: "iat",
          value: new Date(claims.iat * 1000).toISOString(),
          tone: "slate",
        });
      }
    }

    const structureOk = parts.length === 3;

    return { header, payload, signature, structureOk, statuses };
  }, [input]);

  const toneClasses: Record<string, string> = {
    red: "border-red-200 bg-red-50 text-red-700",
    green: "border-green-200 bg-green-50 text-green-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>JWT</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSJ9.signature"
          className="min-h-[120px] break-all"
        />
      </div>

      {result && !result.structureOk && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          A JWT should have 3 dot-separated segments (header.payload.signature).
          This token has {input.trim().split(".").length}.
        </p>
      )}

      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="mb-0">Header</Label>
              <CopyButton value={result.header.json} />
            </div>
            <Textarea
              readOnly
              value={result.header.error ?? result.header.json}
              className={`min-h-[160px] ${
                result.header.error
                  ? "border-red-300 bg-red-50/40 text-red-700"
                  : ""
              }`}
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="mb-0">Payload</Label>
              <CopyButton value={result.payload.json} />
            </div>
            <Textarea
              readOnly
              value={result.payload.error ?? result.payload.json}
              className={`min-h-[160px] ${
                result.payload.error
                  ? "border-red-300 bg-red-50/40 text-red-700"
                  : ""
              }`}
            />
          </div>
        </div>
      )}

      {result && result.statuses.length > 0 && (
        <div>
          <Label>Time-based claims</Label>
          <div className="flex flex-wrap gap-2">
            {result.statuses.map((s) => (
              <span
                key={s.label}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs ${toneClasses[s.tone]}`}
              >
                <span className="font-semibold">{s.label}:</span>
                <span className="font-mono">{s.value}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div>
          <Label>Signature</Label>
          <pre className="overflow-auto rounded-lg border border-slate-200 bg-white p-3 font-mono text-[13px] break-all text-slate-500">
            {result.signature || "(none)"}
          </pre>
          <p className="mt-2 text-xs text-slate-500">
            Decoding only inspects the contents — it does not verify the
            signature against a secret.
          </p>
        </div>
      )}
    </div>
  );
}
