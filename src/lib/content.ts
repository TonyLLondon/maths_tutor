import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { kvGet, worksheetOverrideKey } from "./kv";
import type { AssessmentObjective } from "./topics/catalog";
import type { AnswerKey } from "./questions";
import type { QuestionSupportFile } from "./question-support";

export type WorksheetFrontmatter = {
  title: string;
  topic: string;
  domain: string;
  subject?: string;
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

function repoCandidates(tenantId: string, slug: string): string[] {
  const normalized = slug.split("/").join(path.sep);
  const root = tenantRoot(tenantId);
  return [
    path.join(root, "subjects", "maths", "topics", `${normalized}.md`),
    path.join(root, "topics", `${normalized}.md`),
    path.join(root, "worksheets", `${normalized}.md`),
  ];
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

export async function listMathsTopicSlugs(tenantId: string): Promise<string[]> {
  const slugs: string[] = [];
  await walkMarkdown(
    path.join(tenantRoot(tenantId), "subjects", "maths", "topics"),
    path.join(tenantRoot(tenantId), "subjects", "maths", "topics"),
    slugs,
  );
  await walkMarkdown(
    path.join(tenantRoot(tenantId), "topics"),
    path.join(tenantRoot(tenantId), "topics"),
    slugs,
  );
  return [...new Set(slugs)].sort();
}

export async function listWorksheetSlugs(tenantId: string): Promise<string[]> {
  const maths = await listMathsTopicSlugs(tenantId);
  const legacy: string[] = [];
  await walkMarkdown(
    path.join(tenantRoot(tenantId), "worksheets"),
    path.join(tenantRoot(tenantId), "worksheets"),
    legacy,
  );
  return [...new Set([...maths, ...legacy])].sort();
}

async function readRepoWorksheetUncached(
  tenantId: string,
  slug: string,
): Promise<WorksheetDoc | null> {
  for (const filePath of repoCandidates(tenantId, slug)) {
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

/** Cached per request — hot path for browse + practice. */
export const readRepoWorksheet = cache(readRepoWorksheetUncached);

export async function getWorksheet(
  tenantId: string,
  slug: string,
): Promise<WorksheetDoc | null> {
  const [override, repo] = await Promise.all([
    kvGet<string>(worksheetOverrideKey(tenantId, slug)),
    readRepoWorksheet(tenantId, slug),
  ]);

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

async function readAnswerKeyUncached(
  tenantId: string,
  slug: string,
): Promise<AnswerKey | null> {
  const normalized = slug.split("/").join(path.sep);
  const root = tenantRoot(tenantId);
  const candidates = [
    path.join(root, "subjects", "maths", "topics", `${normalized}.answers.json`),
    path.join(root, "topics", `${normalized}.answers.json`),
    path.join(root, "worksheets", `${normalized}.answers.json`),
  ];
  for (const filePath of candidates) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return JSON.parse(raw) as AnswerKey;
    } catch {
      continue;
    }
  }
  return null;
}

export const getAnswerKey = cache(readAnswerKeyUncached);

async function readQuestionSupportUncached(
  tenantId: string,
  slug: string,
): Promise<QuestionSupportFile | null> {
  const normalized = slug.split("/").join(path.sep);
  const root = tenantRoot(tenantId);
  const candidates = [
    path.join(root, "subjects", "maths", "topics", `${normalized}.support.json`),
    path.join(root, "topics", `${normalized}.support.json`),
  ];
  for (const filePath of candidates) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return JSON.parse(raw) as QuestionSupportFile;
    } catch {
      continue;
    }
  }
  return null;
}

export const getQuestionSupport = cache(readQuestionSupportUncached);

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

export async function mathsTopicCoverage(tenantId: string): Promise<{
  catalogCount: number;
  withWorksheet: number;
  withAnswerKey: number;
  slugs: string[];
}> {
  const slugs = await listMathsTopicSlugs(tenantId);
  let withAnswerKey = 0;
  for (const slug of slugs) {
    if (await getAnswerKey(tenantId, slug)) withAnswerKey += 1;
  }
  const { TOPICS } = await import("./topics/catalog");
  return {
    catalogCount: TOPICS.length,
    withWorksheet: slugs.length,
    withAnswerKey,
    slugs,
  };
}
