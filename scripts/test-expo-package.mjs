import { spawn } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const output = path.join(cwd, "output");
const packages = [];
for (const name of await readdir(output)) {
  if (!name.startsWith("ruta-del-telar-expo-") || name.includes("-electron-") || name.endsWith(".zip") || name.endsWith(".sha256")) continue;
  const absolute = path.join(output, name);
  if ((await stat(absolute)).isDirectory()) packages.push(absolute);
}
packages.sort();
const packagePath = packages.at(-1);
if (!packagePath) throw new Error("No expo package found. Run npm run expo:build first.");
const runtime = path.join(packagePath, "runtime", process.platform === "win32" ? "node.exe" : "node");
const app = path.join(packagePath, "app");
const port = 3214;
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(runtime, ["server.js"], {
  cwd: app,
  env: { ...process.env, RUTA_EXPO_OFFLINE: "true", HOSTNAME: "127.0.0.1", PORT: String(port) },
  stdio: "inherit",
  windowsHide: true,
});

function runPlaywright() {
  return new Promise((resolve, reject) => {
    const cli = path.join(cwd, "node_modules", "@playwright", "test", "cli.js");
    const child = spawn(process.execPath, [cli, "test", "--config=playwright.expo.config.ts"], {
      cwd,
      env: { ...process.env, EXPO_TEST_BASE_URL: baseUrl },
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Expo Playwright failed with ${code}`)));
  });
}

try {
  const deadline = Date.now() + 60_000;
  let ready = false;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Packaged server exited with ${server.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/api/expo/health`, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error("Packaged expo server did not become healthy");
  await runPlaywright();
} finally {
  server.kill("SIGTERM");
}
