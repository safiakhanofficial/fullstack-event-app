# User API Backend

A TypeScript Express backend that serves user data with caching, rate limiting, async deduplication, and built-in performance monitoring. Designed for clarity, performance, and strict TypeScript compliance.

---

## 🚀 Features

- `GET /users/:id` — Fetch user by ID with LRU caching and async deduplication
- `POST /users` — Add a new user to the mock database
- `DELETE /cache` — Clear the cache and reset metrics
- `GET /cache-status` — View cache size, hit/miss stats, pending jobs, and request metrics
- `GET /metrics` — Monitor API performance (response times, error rates, cache stats)
- Rate limiting:
  - Max **100 requests per minute**
  - Max **5 requests per 10 seconds** (burst control)
- In-memory queue simulation (no Redis required)
- Strict TypeScript setup with clean architecture

---

## 📦 Tech Stack

- Express.js
- TypeScript (strict mode)
- `lru-cache` for caching
- `cors`, `body-parser` middleware
- Custom monitoring via middleware and `/metrics` endpoint

---

## 🛠 Setup

```pnpm install```

## 🧪 Run Locally
```npx ts-node-dev src/server.ts```

## Server will start at:
```http://localhost:4000```

## 📬 API Endpoints
### `GET /users/:id`

Fetch a user by ID. Uses cache and async queue simulation.

```curl http://localhost:4000/users/1```

### `POST /users`
Add a new user to the mock database.

```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{"id":4,"name":"New User","email":"new@example.com"}'
```
### `DELETE /cache`
Clear the cache and reset hit/miss counters.
```bash
curl -X DELETE http://localhost:4000/cache
```

### `GET /cache-status`
View cache stats and request metrics.
```bash
curl http://localhost:4000/cache-status
```

### `Example response:`
View cache stats and request metrics.
```bash
{
  "size": 3,
  "hits": 15,
  "misses": 32,
  "pending": 0,
  "totalRequests": 42,
  "errors": 1,
  "samples": 42
}
```

### `GET /metrics`
Monitor API performance.
```bash
curl http://localhost:4000/metrics
```

### `Example response:`
View cache stats and request metrics.
```bash
{
  "totalRequests": 42,
  "errors": 1,
  "avgResponseTime": 18.3,
  "cacheHits": 15,
  "cacheMisses": 27
}
```
