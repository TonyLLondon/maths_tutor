import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import type { GcseDomain } from "./topics/catalog";
import { isGcseDomain } from "./subjects";

export type LearnFrontmatter = {
  kind: "domain" | "topic" | "glossary";
  domain?: GcseDomain;
  code?: string;
  slug?: string;
  title: string;
};

export type LearnArticle = {
  frontmatter: LearnFrontmatter;
  body: string;
};

export type TopicLearnMetaFile = {
  version: 1;
  glossaryTerms?: string[];
};

const LEARN_ROOT = (tenantId: string) =>
  path.join(process.cwd(), "content", "tenants", tenantId, "subjects", "maths", "learn");

export function rewriteLearnMarkdownLinks(body: string, tenantId: string): string {
  const word = (slug: string) =>
    `/t/${tenantId}/subjects/maths/learn/words/${encodeURIComponent(slug)}`;
  return body
    .replace(
      /\]\(\.\.\/\.\.\/glossary\/([a-z0-9-]+)\.md\)/gi,
      `](${word("$1")})`,
    )
    .replace(/\]\(\.\.\/glossary\/([a-z0-9-]+)\.md\)/gi, `](${word("$1")})`);
}

async function readLearnArticle(filePath: string): Promise<LearnArticle | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    return {
      frontmatter: data as LearnFrontmatter,
      body: content.trim(),
    };
  } catch {
    return null;
  }
}

export const getDomainLearnHub = cache(
  async (tenantId: string, domain: GcseDomain): Promise<LearnArticle | null> => {
    if (!isGcseDomain(domain)) return null;
    return readLearnArticle(path.join(LEARN_ROOT(tenantId), "domains", `${domain}.md`));
  },
);

export const getTopicLearnGuide = cache(
  async (
    tenantId: string,
    domain: GcseDomain,
    code: string,
  ): Promise<LearnArticle | null> => {
    if (!isGcseDomain(domain)) return null;
    return readLearnArticle(
      path.join(LEARN_ROOT(tenantId), "topics", domain, `${code}.md`),
    );
  },
);

export const getGlossaryTerm = cache(
  async (tenantId: string, slug: string): Promise<LearnArticle | null> => {
    if (!/^[a-z0-9-]+$/.test(slug)) return null;
    return readLearnArticle(path.join(LEARN_ROOT(tenantId), "glossary", `${slug}.md`));
  },
);

export const listGlossarySlugs = cache(async (tenantId: string): Promise<string[]> => {
  const dir = path.join(LEARN_ROOT(tenantId), "glossary");
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
      .sort();
  } catch {
    return [];
  }
});

export const getTopicLearnMeta = cache(
  async (
    tenantId: string,
    domain: string,
    code: string,
  ): Promise<TopicLearnMetaFile | null> => {
    const filePath = path.join(
      process.cwd(),
      "content",
      "tenants",
      tenantId,
      "subjects",
      "maths",
      "topics",
      domain,
      `${code}.learn.json`,
    );
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as TopicLearnMetaFile;
      if (parsed.version !== 1) return null;
      return parsed;
    } catch {
      return null;
    }
  },
);
