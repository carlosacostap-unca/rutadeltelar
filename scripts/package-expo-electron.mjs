import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { rcedit } from "rcedit";

const cwd = process.cwd();
const output = path.join(cwd, "output");
const outputRoot = path.resolve(output);

async function newestBasePackage() {
  const candidates = [];
  for (const name of await readdir(output)) {
    if (!name.startsWith("ruta-del-telar-expo-") || name.includes("-electron-") || name.endsWith(".zip") || name.endsWith(".sha256")) continue;
    const absolute = path.join(output, name);
    if ((await stat(absolute)).isDirectory()) candidates.push(absolute);
  }
  candidates.sort();
  if (!candidates.length) throw new Error("No hay un paquete base. Ejecute npm run expo:build primero.");
  return candidates.at(-1);
}

function run(command, args, workdir) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: workdir, stdio: "inherit", windowsHide: true });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} terminó con código ${code}`)));
  });
}

const basePackage = await newestBasePackage();
const baseManifest = JSON.parse(await readFile(path.join(basePackage, "package-manifest.json"), "utf8"));
const version = baseManifest.snapshotGeneratedAt.replace(/[:.]/g, "-");
const name = `ruta-del-telar-expo-electron-${version}-win32-x64`;
const target = path.join(output, name);
const zipPath = `${target}.zip`;
const checksumPath = `${zipPath}.sha256`;

for (const candidate of [target, zipPath, checksumPath]) {
  const resolved = path.resolve(candidate);
  if (!resolved.startsWith(`${outputRoot}${path.sep}`)) throw new Error(`Ruta de salida insegura: ${resolved}`);
  await rm(resolved, { recursive: true, force: true });
}

await run(process.execPath, ["scripts/create-expo-electron-icon.mjs"], cwd);
await cp(path.join(cwd, "node_modules", "electron", "dist"), target, { recursive: true, dereference: true });
await rm(path.join(target, "resources", "default_app.asar"), { force: true });
await mkdir(path.join(target, "resources", "app"), { recursive: true });
await cp(path.join(cwd, "electron"), path.join(target, "resources", "app"), { recursive: true });
await writeFile(path.join(target, "resources", "app", "package.json"), `${JSON.stringify({
  name: "ruta-del-telar-expo",
  productName: "Ruta del Telar Expo",
  version: "1.0.0",
  main: "main.cjs",
  private: true,
}, null, 2)}\n`, "utf8");
await cp(basePackage, path.join(target, "resources", "expo"), { recursive: true, dereference: true });
for (const generated of [
  path.join(target, "resources", "expo", "app", ".next", "cache"),
  path.join(target, "resources", "expo", "edge-profile"),
  path.join(target, "resources", "expo", "expo-server.pid"),
  path.join(target, "resources", "expo", "expo-server.out.log"),
  path.join(target, "resources", "expo", "expo-server.err.log"),
]) {
  await rm(generated, { recursive: true, force: true });
}
await cp(path.join(cwd, "docs", "expo-offline-operator.md"), path.join(target, "LEEME.md"));
const executable = path.join(target, "RutaDelTelarExpo.exe");
await rename(path.join(target, "electron.exe"), executable);
await rcedit(executable, {
  icon: path.join(target, "resources", "app", "assets", "app-icon.ico"),
  "file-version": "1.0.0",
  "product-version": "1.0.0",
  "version-string": {
    CompanyName: "Ruta del Telar",
    FileDescription: "Ruta del Telar - Experiencia de exposición",
    InternalName: "RutaDelTelarExpo",
    OriginalFilename: "RutaDelTelarExpo.exe",
    ProductName: "Ruta del Telar Expo",
  },
  "requested-execution-level": "asInvoker",
});

const files = [];
async function inventory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await inventory(absolute);
    else {
      const contents = await readFile(absolute);
      files.push({
        path: path.relative(target, absolute).replaceAll("\\", "/"),
        bytes: contents.byteLength,
        sha256: createHash("sha256").update(contents).digest("hex"),
      });
    }
  }
}
await inventory(target);
files.sort((a, b) => a.path.localeCompare(b.path));
const manifest = {
  format: "ruta-del-telar-expo-electron-v1",
  platform: "win32",
  architecture: "x64",
  electronVersion: JSON.parse(await readFile(path.join(cwd, "node_modules", "electron", "package.json"), "utf8")).version,
  generatedAt: new Date().toISOString(),
  snapshotGeneratedAt: baseManifest.snapshotGeneratedAt,
  files,
  totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
};
const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
await writeFile(path.join(target, "ELECTRON-PACKAGE-MANIFEST.json"), manifestText, "utf8");
await writeFile(
  path.join(target, "ELECTRON-PACKAGE-SHA256.txt"),
  `${createHash("sha256").update(manifestText).digest("hex")}  ELECTRON-PACKAGE-MANIFEST.json\n`,
  "ascii",
);

await run("tar.exe", ["-a", "-c", "-f", path.basename(zipPath), path.basename(target)], output);
const zip = await readFile(zipPath);
const zipHash = createHash("sha256").update(zip).digest("hex");
await writeFile(checksumPath, `${zipHash}  ${path.basename(zipPath)}\n`, "ascii");

console.log(`Electron package: ${target}`);
console.log(`Files: ${files.length}`);
console.log(`Bytes: ${manifest.totalBytes}`);
console.log(`ZIP: ${zipPath} (${zip.byteLength} bytes)`);
console.log(`ZIP SHA-256: ${zipHash}`);
