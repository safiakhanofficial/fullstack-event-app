import express, { Request, Response, NextFunction } from "express";
import { metrics, logMetrics } from "./metrics";
import bodyParser from "body-parser";
import cors from "cors";
import { LRUCache } from "lru-cache";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----- Types -----
type User = { id: number; name: string; email: string };

// ----- Mock Users -----
const mockUsers: Record<number, User> = {
  1: { id: 1, name: "John Doe", email: "john@example.com" },
  2: { id: 2, name: "Jane Smith", email: "jane@example.com" },
  3: { id: 3, name: "Alice Johnson", email: "alice@example.com" },
};

// ----- Cache Setup -----
const cache = new LRUCache<number, User>({
  max: 1000,
  ttl: 60_000, // 60 seconds
});

// ----- Async Deduplication Queue -----
const pendingWork = new Map<number, Promise<User | null>>();

async function fetchUserSimulated(id: number): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockUsers[id] ?? null;
}

function getUserWithDedup(id: number): Promise<User | null> {
  const existing = pendingWork.get(id);
  if (existing) return existing;

  const work = (async () => {
    const user = await fetchUserSimulated(id);
    if (user) cache.set(id, user);
    return user;
  })();

  pendingWork.set(id, work);
  work.finally(() => pendingWork.delete(id));
  return work;
}

// ----- Rate Limiting -----
const requests: Map<string, number[]> = new Map();

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const rawIp =
    req.ip ??
    (req.headers["x-forwarded-for"] as string | undefined) ??
    req.socket.remoteAddress ??
    "unknown";
  const ip = typeof rawIp === "string" ? rawIp : String(rawIp);
  const now = Date.now();

  const recent = requests.get(ip)?.filter((t) => now - t < 60_000) ?? [];

  if (recent.length >= 100) {
    return res.status(429).json({ error: "Rate limit exceeded (100 per minute)" });
  }

  const burst = recent.filter((t) => now - t < 10_000);
  if (burst.length >= 5) {
    return res.status(429).json({ error: "Burst limit exceeded (5 per 10s)" });
  }

  recent.push(now);
  requests.set(ip, recent);
  next();
}

app.use(rateLimit);

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  metrics.totalRequests++;

  res.on("finish", () => {
    const duration = Date.now() - start;
    metrics.responseTimes.push(duration);
    logMetrics();
  });

  res.on("error", () => {
    metrics.errorCount++;
  });

  next();
});

// ----- Root route -----
app.get("/", (_req: Request, res: Response) => {
  res.send("User API backend is running.");
});

// ----- Other routes -----
app.get("/users/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  const cached = cache.get(id);
  if (cached) {
    metrics.cacheHits++;
    return res.json(cached);
  }

  metrics.cacheMisses++;
  try {
    const result = await getUserWithDedup(id);
    if (!result) return res.status(404).json({ error: "User not found" });
    return res.json(result);
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

app.post("/users", (req: Request, res: Response) => {
  const body = req.body as Partial<User>;
  if (
    typeof body.id !== "number" ||
    !Number.isFinite(body.id) ||
    typeof body.name !== "string" ||
    body.name.trim().length === 0 ||
    typeof body.email !== "string" ||
    body.email.trim().length === 0
  ) {
    return res.status(400).json({ error: "Missing or invalid fields: id, name, email" });
  }

  const user: User = {
    id: body.id,
    name: body.name.trim(),
    email: body.email.trim(),
  };
  mockUsers[user.id] = user;
  cache.set(user.id, user);
  return res.status(201).json(user);
});

app.delete("/cache", (_req: Request, res: Response) => {
  cache.clear();
  metrics.cacheHits = 0;
  metrics.cacheMisses = 0;
  return res.json({ message: "Cache cleared" });
});

app.get("/cache-status", (_req: Request, res: Response) => {
  return res.json({
    size: cache.size,
    hits: metrics.cacheHits,
    misses: metrics.cacheMisses,
    pending: pendingWork.size,
    totalRequests: metrics.totalRequests,
    errors: metrics.errorCount,
    samples: metrics.responseTimes.length, // number of response time samples collected
  });
});

// ----- Metrics endpoint -----
app.get("/metrics", (_req: Request, res: Response) => {
  const avgResponseTime =
    metrics.responseTimes.length > 0
      ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
      : 0;

  res.json({
    totalRequests: metrics.totalRequests,
    errors: metrics.errorCount,
    avgResponseTime: Number(avgResponseTime.toFixed(2)),
    cacheHits: metrics.cacheHits,
    cacheMisses: metrics.cacheMisses,
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
