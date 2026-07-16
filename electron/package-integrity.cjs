/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const { createHash } = require("node:crypto");
const { createReadStream, existsSync, readFileSync, statSync } = require("node:fs");
const path = require("node:path");

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function resolveInside(root, relativePath) {
  const absolute = path.resolve(root, relativePath);
  const prefix = `${path.resolve(root)}${path.sep}`;
  if (!absolute.startsWith(prefix)) throw new Error(`Ruta insegura en el manifiesto: ${relativePath}`);
  return absolute;
}

async function verifyPackage(root) {
  const manifestPath = path.join(root, "package-manifest.json");
  const checksumPath = path.join(root, "PACKAGE-SHA256.txt");
  if (!existsSync(manifestPath) || !existsSync(checksumPath)) {
    throw new Error("Faltan package-manifest.json o PACKAGE-SHA256.txt.");
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const expectedManifestHash = readFileSync(checksumPath, "utf8").trim().split(/\s+/)[0];
  const actualManifestHash = createHash("sha256").update(JSON.stringify(manifest)).digest("hex");
  if (expectedManifestHash !== actualManifestHash) throw new Error("El manifiesto del paquete no supera SHA-256.");

  for (const file of manifest.files) {
    const absolute = resolveInside(root, file.path);
    if (!existsSync(absolute)) throw new Error(`Falta un archivo del paquete: ${file.path}`);
    if (statSync(absolute).size !== file.bytes) throw new Error(`Tamaño inválido: ${file.path}`);
    if (await hashFile(absolute) !== file.sha256) throw new Error(`SHA-256 inválido: ${file.path}`);
  }

  return { files: manifest.files.length, bytes: manifest.totalBytes, snapshotGeneratedAt: manifest.snapshotGeneratedAt };
}

async function verifyElectronDistribution(root) {
  const manifestPath = path.join(root, "ELECTRON-PACKAGE-MANIFEST.json");
  const checksumPath = path.join(root, "ELECTRON-PACKAGE-SHA256.txt");
  if (!existsSync(manifestPath) || !existsSync(checksumPath)) {
    throw new Error("Faltan ELECTRON-PACKAGE-MANIFEST.json o ELECTRON-PACKAGE-SHA256.txt.");
  }
  const manifestText = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(manifestText);
  const expectedHash = readFileSync(checksumPath, "utf8").trim().split(/\s+/)[0];
  const actualHash = createHash("sha256").update(manifestText).digest("hex");
  if (expectedHash !== actualHash) throw new Error("El manifiesto Electron no supera SHA-256.");
  for (const file of manifest.files) {
    const absolute = resolveInside(root, file.path);
    if (!existsSync(absolute)) throw new Error(`Falta un archivo Electron: ${file.path}`);
    if (statSync(absolute).size !== file.bytes) throw new Error(`Tamaño Electron inválido: ${file.path}`);
    if (await hashFile(absolute) !== file.sha256) throw new Error(`SHA-256 Electron inválido: ${file.path}`);
  }
  return { files: manifest.files.length, bytes: manifest.totalBytes, snapshotGeneratedAt: manifest.snapshotGeneratedAt };
}

module.exports = { hashFile, resolveInside, verifyElectronDistribution, verifyPackage };
