"use client";

import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { CopyButton } from "@/components/CopyButton";
import { Label, Textarea } from "@/components/ui";

type Algo = "md5" | "sha1" | "sha256" | "sha512";

const ALGOS: Algo[] = ["md5", "sha1", "sha256", "sha512"];

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<Algo, string>>({
    md5: "",
    sha1: "",
    sha256: "",
    sha512: "",
  });

  useEffect(() => {
    if (!input) {
      setHashes({ md5: "", sha1: "", sha256: "", sha512: "" });
      return;
    }
    const text = input;
    const md5 = CryptoJS.MD5(text).toString();
    const sha1 = CryptoJS.SHA1(text).toString();
    const sha256 = CryptoJS.SHA256(text).toString();
    const sha512 = CryptoJS.SHA512(text).toString();
    setHashes({ md5, sha1, sha256, sha512 });
  }, [input]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Input</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Text to hash…"
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-3">
        {ALGOS.map((algo) => (
          <div key={algo}>
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="mb-0 uppercase">{algo}</Label>
              <CopyButton value={hashes[algo]} disabled={!hashes[algo]} />
            </div>
            <pre className="overflow-auto rounded-lg border border-slate-200 bg-white p-3 font-mono text-[13px] break-all text-slate-900">
              {hashes[algo] || "—"}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
