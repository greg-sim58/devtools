"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Label, Textarea } from "@/components/ui";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type Node =
  | { type: "element"; name: string; attrs: [string, string][]; children: Node[]; selfClose: boolean }
  | { type: "text"; value: string };

// Minimal, dependency-free XML parser supporting elements, attributes,
// text nodes, comments and CDATA. Sufficient for formatting common docs.
function parseXml(input: string): { nodes: Node[]; error?: string } {
  const src = input.trim();
  if (!src) return { nodes: [] };
  let i = 0;
  const n = src.length;

  function skipWs() {
    while (i < n && /\s/.test(src[i])) i++;
  }

  function parseNodes(stopOnClose?: string): { nodes: Node[]; error?: string } {
    const out: Node[] = [];
    while (i < n) {
      if (src.startsWith("</", i)) {
        return { nodes: out }; // caller consumes the close tag
      }
      if (src.startsWith("<!--", i)) {
        const end = src.indexOf("-->", i + 4);
        if (end === -1) return { nodes: out, error: "Unterminated comment" };
        i = end + 3;
        continue;
      }
      if (src.startsWith("<![CDATA[", i)) {
        const end = src.indexOf("]]>", i + 9);
        if (end === -1)
          return { nodes: out, error: "Unterminated CDATA section" };
        out.push({ type: "text", value: src.slice(i + 9, end) });
        i = end + 3;
        continue;
      }
      if (src.startsWith("<?", i)) {
        const end = src.indexOf("?>", i + 2);
        if (end === -1) return { nodes: out, error: "Unterminated PI" };
        i = end + 2;
        continue;
      }
      if (src.startsWith("<!", i)) {
        const end = src.indexOf(">", i + 2);
        if (end === -1) return { nodes: out, error: "Unterminated declaration" };
        i = end + 1;
        continue;
      }
      if (src[i] === "<") {
        // opening element
        i++;
        let name = "";
        while (i < n && /[\w:\-.]/.test(src[i])) name += src[i++];
        if (!name) return { nodes: out, error: "Expected element name" };
        const attrs: [string, string][] = [];
        skipWs();
        while (i < n && src[i] !== ">" && src[i] !== "/") {
          let attrName = "";
          while (i < n && /[\w:\-.]/.test(src[i])) attrName += src[i++];
          skipWs();
          if (src[i] !== "=") {
            // attribute without value
            if (attrName) attrs.push([attrName, ""]);
            skipWs();
            continue;
          }
          i++; // =
          skipWs();
          const quote = src[i];
          if (quote !== '"' && quote !== "'")
            return { nodes: out, error: "Expected quote" };
          i++;
          let val = "";
          while (i < n && src[i] !== quote) val += src[i++];
          i++; // closing quote
          attrs.push([attrName, val]);
          skipWs();
        }
        if (src[i] === "/") {
          i += 2; // />
          out.push({ type: "element", name, attrs, children: [], selfClose: true });
          continue;
        }
        i++; // >
        const inner = parseNodes(name);
        if (inner.error) return { nodes: out, error: inner.error };
        // consume closing tag
        if (src.startsWith("</", i)) {
          i += 2;
          while (i < n && src[i] !== ">") i++;
          if (src[i] === ">") i++;
        }
        out.push({
          type: "element",
          name,
          attrs,
          children: inner.nodes,
          selfClose: false,
        });
        continue;
      }
      // text node
      let text = "";
      while (i < n && src[i] !== "<") text += src[i++];
      if (text.trim()) out.push({ type: "text", value: text });
    }
    return { nodes: out, error: stopOnClose ? "Missing closing tag" : undefined };
  }

  const res = parseNodes();
  return res;
}

function serialize(node: Node, depth: number, indentStr: string): string {
  const pad = indentStr.repeat(depth);
  if (node.type === "text") {
    const trimmed = node.value.trim();
    return trimmed ? `${pad}${escapeXml(trimmed)}` : "";
  }
  const attrs = node.attrs.length
    ? " " +
      node.attrs
        .map(([k, v]) => `${k}="${escapeXml(v)}"`)
        .join(" ")
    : "";
  if (node.selfClose || node.children.length === 0) {
    return `${pad}<${node.name}${attrs} />`;
  }
  const onlyText = node.children.every((c) => c.type === "text");
  if (onlyText) {
    const text = node.children
      .map((c) => (c.type === "text" ? c.value.trim() : ""))
      .join("");
    return `${pad}<${node.name}${attrs}>${escapeXml(text)}</${node.name}>`;
  }
  const inner = node.children
    .map((c) => serialize(c, depth + 1, indentStr))
    .filter(Boolean)
    .join("\n");
  return `${pad}<${node.name}${attrs}>\n${inner}\n${pad}</${node.name}>`;
}

export function XmlFormatter() {
  const [input, setInput] = useState(
    '<?xml version="1.0"?><note><to>Tove</to><from>Jani</from><body priority="high">Don\'t forget me this weekend!</body></note>',
  );
  const [minify, setMinify] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    const { nodes, error: parseError } = parseXml(input);
    if (parseError) return { output: "", error: parseError };
    if (nodes.length === 0) return { output: "", error: "No content" };
    if (minify) {
      const out = nodes
        .map((node) => serialize(node, 0, ""))
        .join("")
        .replace(/>\s+</g, "><")
        .trim();
      return { output: out, error: "" };
    }
    const out = nodes.map((node) => serialize(node, 0, "  ")).join("\n");
    return { output: out, error: "" };
  }, [input, minify]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Mode</Label>
        <div className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setMinify(false)}
            className={`rounded-md px-4 py-1 text-xs font-medium transition-colors ${
              !minify
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Beautify
          </button>
          <button
            type="button"
            onClick={() => setMinify(true)}
            className={`rounded-md px-4 py-1 text-xs font-medium transition-colors ${
              minify
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Minify
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label>XML input</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[400px]"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">Output</Label>
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
              <span className="font-semibold">Invalid XML: </span>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
