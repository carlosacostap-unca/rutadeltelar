import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const args = new Set(process.argv.slice(2));

const steps = [
  {
    name: "OpenSpec",
    command: [npmCommand, "run", "openspec:validate"],
  },
  {
    name: "Unit tests",
    command: [npmCommand, "run", "test:unit"],
  },
  {
    name: "Lint",
    command: [npmCommand, "run", "lint"],
  },
  {
    name: "Build",
    command: [npmCommand, "run", "build"],
  },
  {
    name: "Playwright",
    command: [npmCommand, "run", "test:playwright"],
    optionalFlag: "--skip-playwright",
  },
];

function formatDuration(ms) {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  if (minutes === 0) {
    return `${rest}s`;
  }

  return `${minutes}m ${rest}s`;
}

function runStep(step) {
  return new Promise((resolve, reject) => {
    const [command, ...commandArgs] = step.command;
    const child = spawn(command, commandArgs, {
      cwd: process.cwd(),
      env: process.env,
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${step.name} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

const enabledSteps = steps.filter(
  (step) => !step.optionalFlag || !args.has(step.optionalFlag),
);

const startedAt = Date.now();

console.log("\nRuta del Telar verification");
console.log(`Running ${enabledSteps.map((step) => step.name).join(" -> ")}\n`);

for (const step of enabledSteps) {
  const stepStartedAt = Date.now();
  console.log(`\n==> ${step.name}`);

  try {
    await runStep(step);
  } catch (error) {
    console.error(`\nVerification stopped: ${error.message}`);
    process.exit(1);
  }

  console.log(`OK ${step.name} (${formatDuration(Date.now() - stepStartedAt)})`);
}

console.log(`\nAll checks passed (${formatDuration(Date.now() - startedAt)}).`);
