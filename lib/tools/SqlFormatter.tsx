"use client";

import { useMemo, useState } from "react";
import { format as sqlFormat } from "sql-formatter";
import { CopyButton } from "@/components/CopyButton";
import { Button, Label, Select, Textarea } from "@/components/ui";

type Dialect =
  | "sql"
  | "mysql"
  | "postgresql"
  | "sqlite"
  | "mariadb"
  | "bigquery"
  | "tsql";

const DIALECTS: { value: Dialect; label: string }[] = [
  { value: "sql", label: "Standard SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "mariadb", label: "MariaDB" },
  { value: "tsql", label: "T-SQL (SQL Server)" },
  { value: "bigquery", label: "BigQuery" },
];

type KeywordCase = "preserve" | "upper" | "lower";
type Indent = "2" | "4" | "tab";

export function SqlFormatter() {
  const [input, setInput] = useState(
    "select u.id, u.email, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = 1 group by u.id, u.email order by orders desc limit 10;",
  );
  const [dialect, setDialect] = useState<Dialect>("sql");
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
  const [indent, setIndent] = useState<Indent>("2");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const formatted = sqlFormat(input, {
        language: dialect,
        keywordCase: keywordCase === "preserve" ? "preserve" : keywordCase,
        tabWidth: indent === "tab" ? 1 : Number(indent),
        useTabs: indent === "tab",
      });
      return { output: formatted, error: "" };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : String(e) };
    }
  }, [input, dialect, keywordCase, indent]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>Dialect</Label>
          <Select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
            className="w-44"
          >
            {DIALECTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Keywords</Label>
          <Select
            value={keywordCase}
            onChange={(e) => setKeywordCase(e.target.value as KeywordCase)}
            className="w-36"
          >
            <option value="upper">UPPER</option>
            <option value="lower">lower</option>
            <option value="preserve">Preserve</option>
          </Select>
        </div>
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
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label>SQL input</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[320px]"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">Formatted</Label>
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
