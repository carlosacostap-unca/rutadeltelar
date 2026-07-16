import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import path from "node:path";

const remotionCli = path.join(
  process.cwd(),
  "node_modules",
  "@remotion",
  "cli",
  "remotion-cli.js",
);

const args = [
  "render",
  "remotion/index.ts",
  "CatalogoPublicoPromo",
  process.env.PROMO_VIDEO_OUTPUT ?? "public/video/ruta-del-telar-promo.mp4",
  "--codec=h264",
  "--pixel-format=yuv420p",
  "--muted",
  "--browser-executable",
  chromium.executablePath(),
  ...process.argv.slice(2),
];

const child = spawn(process.execPath, [remotionCli, ...args], {
  stdio: "inherit",
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
