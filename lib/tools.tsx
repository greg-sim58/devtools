import type { LucideIcon } from "lucide-react";
import {
  Braces,
  Binary,
  Link2,
  Fingerprint,
  KeyRound,
  Clock,
  Regex as RegexIcon,
  Hash,
  Database,
  FileCode2,
  Table,
  FileJson,
} from "lucide-react";

import { JsonFormatter } from "./tools/JsonFormatter";
import { Base64 } from "./tools/Base64";
import { UrlEncoder } from "./tools/UrlEncoder";
import { UuidGenerator } from "./tools/UuidGenerator";
import { JwtDecoder } from "./tools/JwtDecoder";
import { UnixTimestamp } from "./tools/UnixTimestamp";
import { RegexTester } from "./tools/RegexTester";
import { HashGenerator } from "./tools/HashGenerator";
import { SqlFormatter } from "./tools/SqlFormatter";
import { XmlFormatter } from "./tools/XmlFormatter";
import { CsvJson } from "./tools/CsvJson";
import { YamlFormatter } from "./tools/YamlFormatter";

export type ToolCategory =
  | "Formatters"
  | "Encoders"
  | "Generators";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  component: React.ComponentType;
  keywords: string[];
};

export const CATEGORY_ORDER: ToolCategory[] = [
  "Formatters",
  "Encoders",
  "Generators",
];

export const tools: Tool[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Validate, beautify and minify JSON with clear error messages.",
    category: "Formatters",
    icon: Braces,
    component: JsonFormatter,
    keywords: ["json", "beautify", "minify", "validate", "pretty"],
  },
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    description: "Beautify SQL across dialects with configurable keyword case.",
    category: "Formatters",
    icon: Database,
    component: SqlFormatter,
    keywords: ["sql", "query", "beautify", "mysql", "postgres", "tsql"],
  },
  {
    slug: "xml-formatter",
    name: "XML Formatter",
    description: "Pretty-print or minify XML, with syntax validation.",
    category: "Formatters",
    icon: FileCode2,
    component: XmlFormatter,
    keywords: ["xml", "beautify", "minify", "pretty", "validate"],
  },
  {
    slug: "csv-json",
    name: "CSV ↔ JSON",
    description: "Convert between CSV and JSON with selectable delimiters.",
    category: "Formatters",
    icon: Table,
    component: CsvJson,
    keywords: ["csv", "json", "convert", "table", "delimiter"],
  },
  {
    slug: "yaml-formatter",
    name: "YAML Formatter",
    description: "Format and validate YAML, plus convert to and from JSON.",
    category: "Formatters",
    icon: FileJson,
    component: YamlFormatter,
    keywords: ["yaml", "yml", "json", "convert", "validate", "format"],
  },
  {
    slug: "base64",
    name: "Base64",
    description: "Encode text to Base64 or decode it back, UTF-8 safe.",
    category: "Encoders",
    icon: Binary,
    component: Base64,
    keywords: ["base64", "encode", "decode", "atob", "btoa"],
  },
  {
    slug: "url-encoder",
    name: "URL Encoder",
    description: "Percent-encode and decode URL components or full URIs.",
    category: "Encoders",
    icon: Link2,
    component: UrlEncoder,
    keywords: ["url", "uri", "encode", "decode", "percent", "escape"],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode JWT header and payload and inspect time-based claims.",
    category: "Encoders",
    icon: KeyRound,
    component: JwtDecoder,
    keywords: ["jwt", "json", "token", "decode", "auth", "bearer"],
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Test regular expressions with highlighted matches and groups.",
    category: "Encoders",
    icon: RegexIcon,
    component: RegexTester,
    keywords: ["regex", "regexp", "pattern", "match", "test"],
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256 and SHA-512 hashes of text.",
    category: "Encoders",
    icon: Hash,
    component: HashGenerator,
    keywords: ["hash", "md5", "sha1", "sha256", "sha512", "digest"],
  },
  {
    slug: "uuid-generator",
    name: "UUID / ULID Generator",
    description: "Generate UUID v4 or ULID identifiers in bulk.",
    category: "Generators",
    icon: Fingerprint,
    component: UuidGenerator,
    keywords: ["uuid", "ulid", "guid", "identifier", "random"],
  },
  {
    slug: "unix-timestamp",
    name: "Unix Timestamp",
    description: "Convert between Unix timestamps and human-readable dates.",
    category: "Generators",
    icon: Clock,
    component: UnixTimestamp,
    keywords: ["unix", "timestamp", "epoch", "date", "time"],
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function toolsByCategory(): Record<ToolCategory, Tool[]> {
  const grouped: Record<ToolCategory, Tool[]> = {
    Formatters: [],
    Encoders: [],
    Generators: [],
  };
  for (const t of tools) grouped[t.category].push(t);
  return grouped;
}
