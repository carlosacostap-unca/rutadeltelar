#!/usr/bin/env node

const DEFAULT_URL = "http://127.0.0.1:3000/";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const target = new URL(process.env.LOAD_TEST_URL ?? process.argv[2] ?? DEFAULT_URL);
const totalRequests = readPositiveInt(process.env.LOAD_TEST_REQUESTS, 100);
const concurrency = Math.min(
  readPositiveInt(process.env.LOAD_TEST_CONCURRENCY, 10),
  totalRequests,
);
const timeoutMs = readPositiveInt(process.env.LOAD_TEST_TIMEOUT_MS, 10_000);
const allowRemote = process.env.LOAD_TEST_ALLOW_REMOTE === "true";

if (!allowRemote && !LOCAL_HOSTS.has(target.hostname)) {
  throw new Error(
    `Refusing to load test non-local target ${target.origin}. Set LOAD_TEST_ALLOW_REMOTE=true if this is intentional.`,
  );
}

const startedAt = performance.now();
let nextRequest = 0;
const results = [];

await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (nextRequest < totalRequests) {
      nextRequest += 1;
      results.push(await hitTarget(target, timeoutMs));
    }
  }),
);

const durationMs = performance.now() - startedAt;
const latencies = results.map((result) => result.durationMs).sort((a, b) => a - b);
const statusCounts = countBy(results.map((result) => String(result.status)));
const failures = results.filter((result) => result.error).length;

console.log(JSON.stringify(
  {
    target: target.toString(),
    totalRequests,
    concurrency,
    durationMs: Math.round(durationMs),
    requestsPerSecond: round(totalRequests / (durationMs / 1000), 2),
    failures,
    statusCounts,
    latencyMs: {
      min: Math.round(latencies[0] ?? 0),
      p50: percentile(latencies, 0.5),
      p95: percentile(latencies, 0.95),
      p99: percentile(latencies, 0.99),
      max: Math.round(latencies.at(-1) ?? 0),
    },
  },
  null,
  2,
));

async function hitTarget(url, timeout) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeout);
  const started = performance.now();

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    await response.arrayBuffer();

    return {
      durationMs: performance.now() - started,
      status: response.status,
    };
  } catch (error) {
    return {
      durationMs: performance.now() - started,
      status: "ERR",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeoutHandle);
  }
}

function readPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function countBy(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function percentile(sortedValues, rank) {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil(sortedValues.length * rank) - 1;
  return Math.round(sortedValues[Math.max(0, index)]);
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
