import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { isAllowedUrl } = require("../../electron/network-policy.cjs");
const { resolveInside } = require("../../electron/package-integrity.cjs");

test("Electron network policy allows only the selected local server", () => {
  assert.equal(isAllowedUrl("http://127.0.0.1:3210/mapa", 3210), true);
  assert.equal(isAllowedUrl("http://localhost:3210/", 3210), true);
  assert.equal(isAllowedUrl("data:image/svg+xml;base64,AA==", 3210), true);
  assert.equal(isAllowedUrl("https://example.com/", 3210), false);
  assert.equal(isAllowedUrl("http://127.0.0.1:9999/", 3210), false);
  assert.equal(isAllowedUrl("file:///C:/secret.txt", 3210), false);
});

test("Electron integrity paths cannot escape the package root", () => {
  assert.match(resolveInside("C:\\expo", "app/server.js"), /expo[\\/]app[\\/]server\.js$/);
  assert.throws(() => resolveInside("C:\\expo", "../secret.txt"), /Ruta insegura/);
});
