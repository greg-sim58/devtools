"use client";

import { useMemo, useState } from "react";
import { Label, Textarea } from "@/components/ui";

const FLAG_OPTIONS: { flag: string; label: string }[] = [
  { flag: "g", label: "global" },
  { flag: "i", label: "ignore case" },
  { flag: "m", label: "multiline" },
  { flag: "s", label: "dotall" },
  { flag: "u", label: "unicode" },
  { flag: "y", label: "sticky" },
];

type Match = {
  text: string;
  index: number;
  groups: string[];
};

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<Set<string>>(new Set(["g", "i"]));
  const [text, setText] = useState(
    "The quick brown fox jumps over the lazy dog. FOX@42!",
  );

  const { regex, error } = useMemo(() => {
    if (!pattern) return { regex: null, error: "" };
    try {
      const flagStr = Array.from(flags).join("");
      return { regex: new RegExp(pattern, flagStr), error: "" };
    } catch (e) {
      return {
        regex: null,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }, [pattern, flags]);

  const { matches, highlighted } = useMemo(() => {
    if (!regex || error) return { matches: [] as Match[], highlighted: text };
    const found: Match[] = [];
    const globalRegex = regex.global
      ? regex
      : new RegExp(regex.source, regex.flags + "g");

    let m: RegExpExecArray | null;
    let safety = 0;
    while ((m = globalRegex.exec(text)) !== null && safety < 5000) {
      found.push({
        text: m[0],
        index: m.index,
        groups: m.slice(1).map((g) => g ?? ""),
      });
      if (m.index === globalRegex.lastIndex) globalRegex.lastIndex++;
      safety++;
    }
    if (!regex.global && found.length > 0) found.length = 1;

    // Build highlighted output
    let html = "";
    let last = 0;
    for (const f of found) {
      html += escapeHtml(text.slice(last, f.index));
      html += `<mark class="rounded bg-amber-200/70 px-0.5">${escapeHtml(
        f.text,
      )}</mark>`;
      last = f.index + f.text.length;
    }
    html += escapeHtml(text.slice(last));

    return { matches: found, highlighted: html };
  }, [regex, text, error]);

  function toggleFlag(flag: string) {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Pattern</Label>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
          <span className="font-mono text-slate-400">/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck={false}
            placeholder="\b(\w+)\b"
            className="h-10 flex-1 bg-transparent font-mono text-sm text-slate-900 focus:outline-none"
          />
          <span className="font-mono text-slate-400">/</span>
          <span className="font-mono text-sm text-slate-500">
            {Array.from(flags).join("")}
          </span>
        </div>
      </div>

      <div>
        <Label>Flags</Label>
        <div className="flex flex-wrap gap-2">
          {FLAG_OPTIONS.map(({ flag, label }) => (
            <button
              key={flag}
              type="button"
              onClick={() => toggleFlag(flag)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                flags.has(flag)
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="font-mono font-semibold">{flag}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Test text</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          <span className="font-semibold">Invalid regex: </span>
          {error}
        </p>
      ) : (
        <>
          <div>
            <Label>Preview</Label>
            <div
              className="min-h-[80px] whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white p-3 font-mono text-[13px] leading-relaxed text-slate-900"
              dangerouslySetInnerHTML={{
                __html: highlighted || escapeHtml(text),
              }}
            />
          </div>

          <div>
            <Label>Matches ({matches.length})</Label>
            {matches.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-sm text-slate-400">
                No matches.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium">Match</th>
                      <th className="px-3 py-2 font-medium">Index</th>
                      <th className="px-3 py-2 font-medium">Groups</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {matches.map((m, i) => (
                      <tr key={i} className="align-top">
                        <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2 font-mono text-slate-900">
                          {m.text || <span className="text-slate-400">∅</span>}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-500">
                          {m.index}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-600">
                          {m.groups.length === 0
                            ? "—"
                            : m.groups.map((g, gi) => (
                                <span
                                  key={gi}
                                  className="mr-2 inline-block"
                                >
                                  <span className="text-slate-400">
                                    ${gi + 1}:
                                  </span>{" "}
                                  {g || "∅"}
                                </span>
                              ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
