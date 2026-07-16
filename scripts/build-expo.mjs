import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(npm, args, {
      cwd: process.cwd(),
      env: { ...process.env, ...extraEnv },
      shell: process.platform === "win32",
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${args.join(" ")} failed with ${code}`)));
  });
}

await run(["run", "build"], { RUTA_EXPO_OFFLINE: "true" });
await run(["run", "expo:package"]);
