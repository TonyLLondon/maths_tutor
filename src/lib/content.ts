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

function tenantDir(tenantId: string): string {
  return path.join(CONTENT_ROOT, tenantId, "worksheets");
}

export async function listWorksheetSlugs(tenantId: string): Promise<string[]> {
  const dir = tenantDir(tenantId);
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
      .sort();
  } catch {
    return [];
  }
}

async function readRepoWorksheet(
  tenantId: string,
  slug: string,
): Promise<WorksheetDoc | null> {
  const filePath = path.join(tenantDir(tenantId), `${slug}.md`);
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
    return null;
  }
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
      frontmatter: (data as WorksheetFrontmatter) ?? repo?.frontmatter ?? { title: slug, topic: "", domain: "" },
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
