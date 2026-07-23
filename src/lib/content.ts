import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { kvGet, worksheetOverrideKey } from "./kv";
import type { AssessmentObjective } from "./topics/catalog";

export type WorksheetFrontmatter = {
  title: string;
  topic: string;
  domain: string;
  ao?: AssessmentObjective[];
  week?: number;
  printNotes?: string;
};

export type WorksheetDoc = {
  slug: string;
  source: "repo" | "kv";
  frontmatter: WorksheetFrontmatter;
  body: string;
};

const CONTENT_ROOT = path.join(process.cwd(), "content", "tenants");

function tenantRoot(tenantId: string): string {
  return path.join(CONTENT_ROOT, tenantId);
}

async function walkMarkdown(
  dir: string,
  base: string,
  slugs: string[],
): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkMarkdown(full, base, slugs);
      continue;
    }
    if (!entry.name.endsWith(".md") || entry.name === "README.md") continue;
    const rel = path.relative(base, full).replace(/\.md$/, "");
    slugs.push(rel.split(path.sep).join("/"));
  }
}

export async function listWorksheetSlugs(tenantId: string): Promise<string[]> {
  const slugs: string[] = [];
  await walkMarkdown(
    path.join(tenantRoot(tenantId), "topics"),
    path.join(tenantRoot(tenantId), "topics"),
    slugs,
  );
  await walkMarkdown(
    path.join(tenantRoot(tenantId), "worksheets"),
    path.join(tenantRoot(tenantId), "worksheets"),
    slugs,
  );
  return [...new Set(slugs)].sort();
}

async function readRepoWorksheet(
  tenantId: string,
  slug: string,
): Promise<WorksheetDoc | null> {
  const normalized = slug.split("/").join(path.sep);
  const candidates = [
    path.join(tenantRoot(tenantId), "topics", `${normalized}.md`),
    path.join(tenantRoot(tenantId), "worksheets", `${normalized}.md`),
  ];
  for (const filePath of candidates) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        source: "repo",
        frontmatter: data as WorksheetFrontmatter,
        body: content.trim(),
      };
    } catch {
      continue;
    }
  }
  return null;
}

export async function getWorksheet(
  tenantId: string,
  slug: string,
): Promise<WorksheetDoc | null> {
  const override = await kvGet<string>(worksheetOverrideKey(tenantId, slug));
  const repo = await readRepoWorksheet(tenantId, slug);

  if (override != null) {
    const { data, content } = matter(override);
    return {
      slug,
      source: "kv",
      frontmatter:
        (data as WorksheetFrontmatter) ??
        repo?.frontmatter ?? {
          title: slug,
          topic: "",
          domain: "",
        },
      body: content.trim(),
    };
  }

  return repo;
}

export async function listWorksheets(tenantId: string): Promise<WorksheetDoc[]> {
  const slugs = await listWorksheetSlugs(tenantId);
  const docs = await Promise.all(slugs.map((s) => getWorksheet(tenantId, s)));
  return docs.filter((d): d is WorksheetDoc => d != null);
}

export function serializeWorksheet(
  frontmatter: WorksheetFrontmatter,
  body: string,
): string {
  return matter.stringify(body, frontmatter);
}
