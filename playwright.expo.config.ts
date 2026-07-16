import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.EXPO_TEST_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e-expo",
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: { baseURL: externalBaseUrl ?? "http://127.0.0.1:3213", trace: "on-first-retry" },
  webServer: externalBaseUrl ? undefined : {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3213",
    url: "http://127.0.0.1:3213/api/expo/health",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { RUTA_EXPO_OFFLINE: "true", POCKETBASE_URL: "", NEXT_PUBLIC_POCKETBASE_URL: "" },
  },
  projects: [{ name: "expo-chromium", use: { ...devices["Desktop Chrome"] } }],
});
