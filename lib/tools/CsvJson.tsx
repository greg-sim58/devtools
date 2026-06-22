"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { CopyButton } from "@/components/CopyButton";
import { Button, Label, Select, Textarea } from "@/components/ui";

type Direction = "csv2json" | "json2csv";
type Delimiter = "," | ";" | "\t" | "|";

const DELIMITERS: { value: Delimiter; label: string }[] = [
  { value: ",", label: "Comma (,)" },
  { value: ";", label: "Semicolon (;)" },
  { value: "\t", label: "Tab" },
  { value: "|", label: "Pipe (|)" },
];

export function CsvJson() {
  const [input, setInput] = useState(
    "name,role,city\nAda,Engineer,London\nLinus,Founder,Helsinki",
  );
  const [direction, setDirection] = useState<Direction>("csv2json");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [headerRow, setHeaderRow] = useState(true);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      if (direction === "csv2json") {
        const result = Papa.parse(input, {
          delimiter,
          header: headerRow,
          skipEmptyLines: true,
        });
        if (result.errors.length) {
          return {
            output: "",
            error: result.errors[0].message,
          };
        }
        return { output: JSON.stringify(result.data, null, 2), error: "" };
      } else {
        let data: unknown;
        try {
          data = JSON.parse(input);
        } catch (e) {
          return {
            output: "",
            error: e instanceof Error ? e.message : String(e),
          };
        }
        const csv = Papa.unparse(data as object[], { delimiter });
        return { output: csv, error: "" };
      }
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : String(e) };
    }
  }, [input, direction, delimiter, headerRow]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>Direction</Label>
          <div className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {(
              [
                ["csv2json", "CSV → JSON"],
                ["json2csv", "JSON → CSV"],
              ] as [Direction, string][]
            ).map(([d, label]) => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  direction === d
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Delimiter</Label>
          <Select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value as Delimiter)}
            className="w-36"
          >
            {DELIMITERS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex h-10 cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={headerRow}
            onChange={(e) => setHeaderRow(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-slate-900"
          />
          First row is header
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label>{direction === "csv2json" ? "CSV" : "JSON"}</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[320px]"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">
              {direction === "csv2json" ? "JSON" : "CSV"}
            </Label>
            <CopyButton value={output} disabled={!!error} />
          </div>
          <Textarea
            readOnly
            value={error ? "" : output}
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

      <Button variant="ghost" size="sm" onClick={() => setInput("")}>
        Clear
      </Button>
    </div>
  );
}
