import { spawn } from "node:child_process";
import { readFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const output = path.join(cwd, "output");
const candidates = [];
for (const name of await readdir(output)) {
  if (!name.startsWith("ruta-del-telar-expo-electron-") || name.endsWith(".zip") || name.endsWith(".sha256")) continue;
  const absolute = path.join(output, name);
  if ((await stat(absolute)).isDirectory()) candidates.push(absolute);
}
candidates.sort();
const packagePath = process.argv[2] ? path.resolve(process.argv[2]) : candidates.at(-1);
if (!packagePath) throw new Error("No hay un paquete Electron. Ejecute npm run expo:electron:build.");
const executable = path.join(packagePath, "RutaDelTelarExpo.exe");

async function runOnce(index) {
  const reportPath = path.join(output, `.electron-smoke-${process.pid}-${index}.json`);
  const splashCapturePath = path.join(output, "electron-splash.png");
  await rm(reportPath, { force: true });
  const child = spawn(executable, [], {
    cwd: packagePath,
    env: {
      ...process.env,
      RUTA_EXPO_ELECTRON_SMOKE: "true",
      RUTA_EXPO_ELECTRON_REPORT: reportPath,
      RUTA_EXPO_ELECTRON_SPLASH_CAPTURE: index === 1 ? splashCapturePath : "",
    },
    stdio: "inherit",
    windowsHide: true,
  });
  const exitCode = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error("Electron smoke test excedió 180 segundos.")); }, 180_000);
    child.on("error", reject);
    child.on("exit", (code) => { clearTimeout(timer); resolve(code); });
  });
  if (exitCode !== 0) throw new Error(`Electron smoke test ${index} terminó con código ${exitCode}.`);
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  await rm(reportPath, { force: true });
  if (!report.ok || !report.externalBlocked || !report.localUrlAllowed || !report.vectorMapLoaded || !report.splashShown || report.splashStageCount < 4) {
    throw new Error(`Autodiagnóstico Electron inválido: ${JSON.stringify(report)}`);
  }
  console.log(`Electron smoke ${index} passed: ${report.title}; PMTiles map loaded; splash with ${report.splashStageCount} stages; ${report.integrity.files} package files verified; ${report.corePaths} core paths; ${report.blockedRequests} external request blocked.`);
}

await runOnce(1);
await runOnce(2);
