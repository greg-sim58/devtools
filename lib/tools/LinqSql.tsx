"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Button, Label, Select, Textarea } from "@/components/ui";

type Dialect = "sqlserver" | "postgresql" | "mysql" | "sqlite";
type Direction = "linq-to-sql" | "sql-to-linq";

const EXAMPLES: { label: string; input: string; dialect: Dialect }[] = [
  {
    label: "LINQ: Where + Select + Take",
    input: "dbContext.Users.Where(u => u.Age > 25).Select(u => u.Name).Take(10)",
    dialect: "sqlserver",
  },
  {
    label: "SQL: SELECT with WHERE + ORDER BY",
    input: "SELECT id, name FROM users WHERE active = 1 ORDER BY created_at DESC LIMIT 10",
    dialect: "postgresql",
  },
  {
    label: "LINQ: Join (inner)",
    input:
      "dbContext.Orders.Join(dbContext.Customers, o => o.CustomerId, c => c.Id, (o, c) => new { o.Id, c.Name })",
    dialect: "sqlserver",
  },
  {
    label: "LINQ: GroupBy + Count",
    input:
      "dbContext.Orders.GroupBy(o => o.Status).Select(g => new { Status = g.Key, Count = g.Count() })",
    dialect: "sqlserver",
  },
];

export function LinQSql() {
  const [input, setInput] = useState("");
  const [dialect, setDialect] = useState<Dialect>("sqlserver");
  const [direction, setDirection] = useState<Direction>("linq-to-sql");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function translate() {
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const res = await fetch("/api/linq-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, dialect, direction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setOutput(data.translated);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function loadExample(ex: (typeof EXAMPLES)[number]) {
    setInput(ex.input);
    setDialect(ex.dialect);
    setOutput("");
    setError("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>Direction</Label>
          <div className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {(
              ["linq-to-sql", "sql-to-linq"] as Direction[]
            ).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDirection(d);
                  setOutput("");
                  setError("");
                }}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  direction === d
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {d === "linq-to-sql" ? "LINQ → SQL" : "SQL → LINQ"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Dialect</Label>
          <Select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
            className="w-44"
          >
            <option value="sqlserver">SQL Server</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="sqlite">SQLite</option>
          </Select>
        </div>
        <div>
          <Label>Example</Label>
          <Select
            onChange={(e) => {
              const idx = e.target.value;
              if (idx) loadExample(EXAMPLES[Number(idx)]);
            }}
            className="w-64"
          >
            <option value="">Load example…</option>
            {EXAMPLES.map((ex, i) => (
              <option key={i} value={i}>
                {ex.label}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="primary"
          onClick={translate}
          disabled={loading || !input.trim()}
        >
          {loading ? "Translating…" : "Translate"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label>{direction === "linq-to-sql" ? "LINQ" : "SQL"}</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[400px]"
            placeholder={
              direction === "linq-to-sql"
                ? "dbContext.Users.Where(u => u.Age > 25)"
                : "SELECT * FROM users WHERE active = 1"
            }
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">
              {direction === "linq-to-sql" ? "SQL" : "LINQ"}
            </Label>
            <CopyButton value={output} disabled={!output} />
          </div>
          <Textarea
            readOnly
            value={output}
            placeholder="Translated output will appear here."
            className="min-h-[400px]"
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
        <span className="font-medium">Note:</span> Translation sends your
        input to the Gemini 2.0 Flash model via OpenRouter. Review the
        result before using in production. Navigation properties
        (<code className="mx-1 rounded bg-slate-100 px-1 py-0.5">Include()</code>)
        and complex expressions are flagged in the output.
      </p>
    </div>
  );
}