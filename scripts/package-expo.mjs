import { createHash } from "node:crypto";
import { copyFile, cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const manifest = JSON.parse(await readFile(path.join(cwd, "public", "expo", "snapshot.json"), "utf8"));
const version = manifest.generatedAt.replace(/[:.]/g, "-");
const target = path.join(cwd, "output", `ruta-del-telar-expo-${version}`);
const appDir = path.join(target, "app");
const outputRoot = path.resolve(cwd, "output");

if (!path.resolve(target).startsWith(`${outputRoot}${path.sep}`)) {
  throw new Error(`Refusing to replace package outside output: ${target}`);
}

await stat(path.join(cwd, ".next", "standalone", "server.js"));
await rm(target, { recursive: true, force: true });
await mkdir(appDir, { recursive: true });
await cp(path.join(cwd, ".next", "standalone"), appDir, { recursive: true, dereference: true });
await cp(path.join(cwd, ".next", "static"), path.join(appDir, ".next", "static"), { recursive: true });
await cp(path.join(cwd, "public"), path.join(appDir, "public"), { recursive: true });
await mkdir(path.join(target, "runtime"), { recursive: true });
await copyFile(process.execPath, path.join(target, "runtime", process.platform === "win32" ? "node.exe" : "node"));
await copyFile(path.join(cwd, "scripts", "expo", "start-expo.ps1"), path.join(target, "start-expo.ps1"));
await copyFile(path.join(cwd, "scripts", "expo", "start-expo.cmd"), path.join(target, "start-expo.cmd"));
await copyFile(path.join(cwd, "docs", "expo-offline-operator.md"), path.join(target, "LEEME.md"));

const files = [];
async function inventory(directory) {
  const { readdir } = await import("node:fs/promises");
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
const packageManifest = {
  generatedAt: new Date().toISOString(),
  snapshotGeneratedAt: manifest.generatedAt,
  snapshotDataSha256: manifest.dataSha256,
  files,
  totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
};
await writeFile(path.join(target, "package-manifest.json"), `${JSON.stringify(packageManifest, null, 2)}\n`, "utf8");
const checksum = createHash("sha256").update(JSON.stringify(packageManifest)).digest("hex");
await writeFile(path.join(target, "PACKAGE-SHA256.txt"), `${checksum}  package-manifest.json\n`, "utf8");

console.log(`Expo package: ${target}`);
console.log(`Files: ${files.length}`);
console.log(`Bytes: ${packageManifest.totalBytes}`);
console.log(`Manifest SHA-256: ${checksum}`);
