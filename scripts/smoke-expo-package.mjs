import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";

const output = path.join(process.cwd(), "output");
const requested = process.argv[2];
const basePackages = [];
for (const name of await readdir(output)) {
  if (!name.startsWith("ruta-del-telar-expo-") || name.endsWith(".zip") || name.endsWith(".sha256")) continue;
  const absolute = path.join(output, name);
  const { stat } = await import("node:fs/promises");
  if ((await stat(absolute)).isDirectory()) basePackages.push(absolute);
}
basePackages.sort();
const packagePath = requested ? path.resolve(requested) : basePackages.at(-1);
if (!packagePath) throw new Error("No expo package found. Run npm run expo:build first.");
const node = path.join(packagePath, "runtime", process.platform === "win32" ? "node.exe" : "node");
const app = path.join(packagePath, "app");
const port = 3221;
const child = spawn(node, ["server.js"], {
  cwd: app,
  env: { ...process.env, RUTA_EXPO_OFFLINE: "true", HOSTNAME: "127.0.0.1", PORT: String(port) },
  stdio: "inherit",
  windowsHide: true,
});

try {
  const deadline = Date.now() + 60_000;
  let healthy = false;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Packaged server exited with ${child.exitCode}`);
    try {
      const health = await fetch(`http://127.0.0.1:${port}/api/expo/health`, { signal: AbortSignal.timeout(2_000) });
      const home = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(5_000) });
      if (health.ok && home.ok && (await home.text()).includes("Ruta del Telar")) { healthy = true; break; }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!healthy) throw new Error("Packaged cold-start smoke test timed out");
  console.log(`Expo package smoke test passed: ${packagePath}`);
} finally {
  child.kill("SIGTERM");
}
