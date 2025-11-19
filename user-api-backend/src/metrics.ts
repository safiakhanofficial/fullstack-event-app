export const metrics = {
  totalRequests: 0,
  errorCount: 0,
  responseTimes: [] as number[],
  cacheHits: 0,
  cacheMisses: 0,
};

export function logMetrics() {
  const avgResponseTime =
    metrics.responseTimes.length > 0
      ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
      : 0;

  console.log("📊 Metrics:");
  console.log(`- Total Requests: ${metrics.totalRequests}`);
  console.log(`- Errors: ${metrics.errorCount}`);
  console.log(`- Avg Response Time: ${avgResponseTime.toFixed(2)} ms`);
  console.log(`- Cache Hits: ${metrics.cacheHits}`);
  console.log(`- Cache Misses: ${metrics.cacheMisses}`);
}
