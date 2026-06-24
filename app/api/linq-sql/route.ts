import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_WINDOW = 60_000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 10;

// Simple in-memory rate limiter (per-instance, suitable for single-server dev)
// In production, swap for Redis or Upstash rate limiting
const rateLimitStore = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const hits = rateLimitStore.get(ip) ?? [];
  const recent = hits.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitStore.set(ip, recent);
    return false;
  }
  recent.push(now);
  rateLimitStore.set(ip, recent);
  return true;
}

// Dialect hints for the model
const DIALECT_HINTS: Record<string, string> = {
  sqlserver: "SQL Server (T-SQL). Use TOP, square-bracket quoting, and LEN().",
  postgresql: "PostgreSQL. Use LIMIT/OFFSET, double-quote quoting, and LENGTH().",
  mysql: "MySQL. Use LIMIT, backtick quoting, and LENGTH().",
  sqlite: "SQLite. Use LIMIT, double-quote quoting, and LENGTH().",
};

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before trying again." },
      { status: 429 },
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server not configured. Set OPENROUTER_API_KEY env var." },
      { status: 500 },
    );
  }

  const { input, dialect, direction } = await req.json();

  if (!input?.trim()) {
    return NextResponse.json(
      { error: "Input is empty." },
      { status: 400 },
    );
  }

  const outLang = direction === "sql-to-linq" ? "LINQ" : "SQL";
  const inLang = direction === "sql-to-linq" ? "SQL" : "LINQ";
  const dialectHint = DIALECT_HINTS[dialect] ?? DIALECT_HINTS.sqlserver;

  const system = `You are a precise C#/SQL translator. Output ONLY the translated code, no prose.
Target dialect: ${dialectHint}
If input uses Include(), navigation properties, or complex C# expressions, add a comment on the FIRST line: // NOTE: Manual JOIN/Navigation property required.
If input is neither valid ${inLang} nor close to it, respond with: // Invalid input.`;

  const user = `${direction === "sql-to-linq" ? "Convert to LINQ (method chain syntax):\n" : "Convert to SQL:\n"}${input.trim()}`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-lite",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.1,
          max_tokens: 1000,
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `Model API error: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content ?? "";

    if (!translated) {
      return NextResponse.json(
        { error: "Empty response from model." },
        { status: 502 },
      );
    }

    return NextResponse.json({ translated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Translation failed: ${msg}` },
      { status: 502 },
    );
  }
}