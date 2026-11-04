/**
 * @jest-environment node
 */
// Guards public/sw.js against the 2026-11-04 regression: the old worker
// pre-cached /dashboard (a logged-out redirect) and answered navigations from
// cache, which made every refresh of a signed-in page fail with ERR_FAILED.
import fs from "fs";
import path from "path";
import vm from "vm";

type Listener = (event: Record<string, unknown>) => void;

function loadWorker() {
  const listeners: Record<string, Listener> = {};
  const precached: string[][] = [];
  const sandbox = {
    self: {
      addEventListener: (type: string, fn: Listener) => (listeners[type] = fn),
      location: { origin: "https://tapcash.example" },
      skipWaiting: () => undefined,
      clients: { claim: () => Promise.resolve() },
      registration: { showNotification: () => Promise.resolve() },
    },
    caches: {
      open: () => Promise.resolve({ addAll: (urls: string[]) => { precached.push(urls); return Promise.resolve(); }, put: () => Promise.resolve() }),
      keys: () => Promise.resolve([]),
      match: () => Promise.resolve(undefined),
      delete: () => Promise.resolve(true),
    },
    clients: { matchAll: () => Promise.resolve([]), openWindow: () => Promise.resolve() },
    fetch: () => Promise.resolve({ ok: true, redirected: false, type: "basic", clone() { return this; } }),
    URL,
    Promise,
  };
  const code = fs.readFileSync(path.join(__dirname, "../../public/sw.js"), "utf8");
  vm.runInNewContext(code, sandbox);
  return { listeners, precached };
}

function fetchEvent(url: string, init: { mode?: string; destination?: string; method?: string } = {}) {
  let responded = false;
  const event = {
    request: { url, method: init.method ?? "GET", mode: init.mode ?? "no-cors", destination: init.destination ?? "" },
    respondWith: () => { responded = true; },
  };
  return { event, responded: () => responded };
}

describe("public/sw.js", () => {
  it("never pre-caches pages", async () => {
    const { listeners, precached } = loadWorker();
    listeners.install({ waitUntil: (p: Promise<unknown>) => p });
    await new Promise((r) => setImmediate(r));
    const urls = precached.flat();
    expect(urls).not.toContain("/");
    expect(urls).not.toContain("/dashboard");
    expect(urls.every((u) => !u.endsWith("/") || u === "")).toBe(true);
  });

  it.each(["/dashboard", "/rewards", "/cashout", "/"])("does not intercept navigation to %s", (p) => {
    const { listeners } = loadWorker();
    const e = fetchEvent(`https://tapcash.example${p}`, { mode: "navigate", destination: "document" });
    listeners.fetch(e.event);
    expect(e.responded()).toBe(false);
  });

  it("does not intercept API calls or non-GET requests", () => {
    const { listeners } = loadWorker();
    const api = fetchEvent("https://tapcash.example/api/user/balance");
    listeners.fetch(api.event);
    expect(api.responded()).toBe(false);
    const post = fetchEvent("https://tapcash.example/_next/static/app.js", { method: "POST" });
    listeners.fetch(post.event);
    expect(post.responded()).toBe(false);
  });

  it("serves hashed static assets", () => {
    const { listeners } = loadWorker();
    const asset = fetchEvent("https://tapcash.example/_next/static/chunks/main-abc123.js", { destination: "script" });
    listeners.fetch(asset.event);
    expect(asset.responded()).toBe(true);
  });

  it("ignores cross-origin requests", () => {
    const { listeners } = loadWorker();
    const ext = fetchEvent("https://firestore.googleapis.com/x.js", { destination: "script" });
    listeners.fetch(ext.event);
    expect(ext.responded()).toBe(false);
  });
});
