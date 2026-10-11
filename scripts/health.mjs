const services = [
  ["Frontend", "http://127.0.0.1:5173/"],
  ["Backend", "http://127.0.0.1:5000/api/health"],
  ["AI", "http://127.0.0.1:8000/health"],
];

const checks = await Promise.all(
  services.map(async ([name, url]) => {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
      return { name, url, healthy: response.ok, detail: `HTTP ${response.status}` };
    } catch (error) {
      return {
        name,
        url,
        healthy: false,
        detail: error instanceof Error ? error.message : "Request failed",
      };
    }
  }),
);

for (const check of checks) {
  console.log(`${check.healthy ? "OK" : "FAIL"}  ${check.name.padEnd(8)} ${check.url} (${check.detail})`);
}

if (checks.some((check) => !check.healthy)) process.exitCode = 1;
