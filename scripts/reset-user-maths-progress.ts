/**
 * Delete all maths progress keys for a user (fresh start → level 500 per topic).
 * Run: npx tsx scripts/reset-user-maths-progress.ts archer
 * Uses KV_REST_* from .env.local when set; always clears .data/kv-dev.json matches.
 */
import fs from "node:fs/promises";
import path from "node:path";

const userId = process.argv[2] ?? "archer";
const prefix = `mt:user:${userId}:progress:maths:`;

const DEV_STORE = path.join(process.cwd(), ".data", "kv-dev.json");

async function clearDevStore(): Promise<number> {
  let store: Record<string, unknown> = {};
  try {
    store = JSON.parse(await fs.readFile(DEV_STORE, "utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return 0;
  }
  let n = 0;
  for (const key of Object.keys(store)) {
    if (key.startsWith(prefix)) {
      delete store[key];
      n += 1;
    }
  }
  if (n > 0) {
    await fs.mkdir(path.dirname(DEV_STORE), { recursive: true });
    await fs.writeFile(DEV_STORE, JSON.stringify(store, null, 2), "utf8");
  }
  return n;
}

async function clearRemoteKv(): Promise<number> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return 0;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  let cursor = "0";
  const keys: string[] = [];
  do {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(["SCAN", cursor, "MATCH", `${prefix}*`, "COUNT", "200"]),
    });
    if (!res.ok) {
      throw new Error(`KV SCAN failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { result: [string, string[]] };
    cursor = data.result[0];
    keys.push(...data.result[1]);
  } while (cursor !== "0");

  if (keys.length === 0) return 0;

  for (const key of keys) {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(["DEL", key]),
    });
    if (!res.ok) {
      throw new Error(`KV DEL failed for ${key}: ${res.status}`);
    }
  }
  return keys.length;
}

async function main() {
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    const raw = await fs.readFile(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env.local */
  }

  const dev = await clearDevStore();
  const remote = await clearRemoteKv();
  console.log(
    `Reset ${userId} maths progress: ${dev} local key(s), ${remote} remote key(s). Topics start at level 500.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
