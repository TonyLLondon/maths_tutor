import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { __unstable__loadDesignSystem } from "@tailwindcss/node";

const ROOT = process.cwd();

const css =
  readFileSync(join(ROOT, "node_modules/tailwindcss/index.css"), "utf8") +
  "\n" +
  readFileSync(join(ROOT, "src/app/globals.css"), "utf8");

/** Tailwind utilities with arbitrary value brackets (optional variant prefix). */
const MANUAL_REPLACEMENTS: [string, string][] = [
  ["max-w-[min(92vw,26rem)]", "max-w-[min(92vw,--spacing(104))]"],
  ["lg:grid-cols-[minmax(0,1fr)_16rem]", "lg:grid-cols-[minmax(0,1fr)_--spacing(64)]"],
  ["xl:grid-cols-[minmax(0,1fr)_18rem]", "xl:grid-cols-[minmax(0,1fr)_--spacing(72)]"],
  ["text-[10px]", "text-[--spacing(2.5)]"],
  ["min-h-[420px]", "min-h-105"],
  ["min-h-[26.25rem]", "min-h-105"],
  ["min-w-[7rem]", "min-w-28"],
  ["z-[100]", "z-100"],
  ["bg-[var(--background)]", "bg-background"],
  ["bg-gradient-to-r", "bg-linear-to-r"],
  ["bg-gradient-to-br", "bg-linear-to-br"],
];

/** Tailwind utilities with arbitrary value brackets (optional variant prefix). */
const ARBITRARY_CLASS =
  /(?:^|[\s"'`{])([\w-]+(?:\[[^\]]+\])+)(?=[\s"'`}|]|$)/g;

function walk(dir: string, files: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (/\.(tsx|jsx)$/.test(name)) files.push(p);
  }
  return files;
}

function canonicalizeToken(
  ds: Awaited<ReturnType<typeof __unstable__loadDesignSystem>>,
  token: string,
): string {
  const [out] = ds.canonicalizeCandidates([token]);
  return out ?? token;
}

async function main() {
  const ds = await __unstable__loadDesignSystem(css, { base: ROOT });
  const files = walk(join(ROOT, "src"));
  let totalReplacements = 0;
  const changedFiles: string[] = [];

  for (const file of files) {
    let content = readFileSync(file, "utf8");
    const original = content;

    for (const [from, to] of MANUAL_REPLACEMENTS) {
      if (!content.includes(from)) continue;
      const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      const count = (content.match(re) ?? []).length;
      content = content.replace(re, to);
      totalReplacements += count;
      console.log(`${relative(ROOT, file)}: ${from} => ${to} (${count}x)`);
    }

    const seen = new Set<string>();

    for (const m of content.matchAll(ARBITRARY_CLASS)) {
      const token = m[1];
      if (!token.includes("[")) continue;
      if (seen.has(token)) continue;
      seen.add(token);

      const canonical = canonicalizeToken(ds, token);
      if (canonical === token) continue;

      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(escaped, "g");
      const count = (content.match(re) ?? []).length;
      content = content.replace(re, canonical);
      totalReplacements += count;
      console.log(
        `${relative(ROOT, file)}: ${token} => ${canonical} (${count}x)`,
      );
    }

    if (content !== original) {
      writeFileSync(file, content);
      changedFiles.push(relative(ROOT, file));
    }
  }

  if (changedFiles.length === 0) {
    console.log("No canonical class replacements needed.");
  } else {
    console.log(
      `\nUpdated ${changedFiles.length} file(s), ${totalReplacements} replacement(s).`,
    );
  }
}

void main();
