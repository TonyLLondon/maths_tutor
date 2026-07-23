import { kv } from "@vercel/kv";
import fs from "node:fs/promises";
import path from "node:path";

const DEV_STORE = path.join(process.cwd(), ".data", "kv-dev.json");

function kvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function readDevStore(): Promise<Record<string, unknown>> {
  try {
    const raw = await fs.readFile(DEV_STORE, "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function writeDevStore(data: Record<string, unknown>): Promise<void> {
  await fs.mkdir(path.dirname(DEV_STORE), { recursive: true });
  await fs.writeFile(DEV_STORE, JSON.stringify(data, null, 2), "utf8");
}

export async function kvGet<T>(key: string): Promise<T | null> {
  if (kvConfigured()) {
    return (await kv.get<T>(key)) ?? null;
  }
  const store = await readDevStore();
  return (store[key] as T) ?? null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  if (kvConfigured()) {
    await kv.set(key, value);
    return;
  }
  const store = await readDevStore();
  store[key] = value;
  await writeDevStore(store);
}

export async function kvDel(key: string): Promise<void> {
  if (kvConfigured()) {
    await kv.del(key);
    return;
  }
  const store = await readDevStore();
  delete store[key];
  await writeDevStore(store);
}

export function worksheetOverrideKey(tenantId: string, slug: string): string {
  return `mt:tenant:${tenantId}:worksheet:${slug}`;
}

export function tenantMetaKey(tenantId: string): string {
  return `mt:tenant:${tenantId}:meta`;
}
