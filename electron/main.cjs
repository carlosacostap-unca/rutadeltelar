/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const { app, BrowserWindow, dialog, session } = require("electron");
const { spawn } = require("node:child_process");
const { createServer } = require("node:net");
const { mkdirSync, openSync, readFileSync, writeFileSync } = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { installNetworkPolicy, isAllowedUrl } = require("./network-policy.cjs");
const { verifyElectronDistribution } = require("./package-integrity.cjs");

app.commandLine.appendSwitch("disable-background-networking");
app.commandLine.appendSwitch("disable-component-update");
app.commandLine.appendSwitch("disable-domain-reliability");
app.commandLine.appendSwitch("disable-features", "OptimizationHints,MediaRouter,Translate");

let mainWindow;
let splashWindow;
let serverProcess;
let isQuitting = false;
let blockedRequests = 0;
let splashShown = false;
let splashStageCount = 0;

const applicationIcon = path.join(__dirname, "assets", "app-icon.png");

async function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 520,
    height: 500,
    center: true,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    closable: false,
    alwaysOnTop: true,
    show: false,
    title: "Cargando Ruta del Telar",
    icon: applicationIcon,
    backgroundColor: "#082d49",
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });
  await splashWindow.loadFile(path.join(__dirname, "splash.html"));
  splashShown = true;
  if (process.env.RUTA_EXPO_ELECTRON_SMOKE !== "true") splashWindow.show();
}

async function updateSplash(message) {
  splashStageCount += 1;
  if (!splashWindow || splashWindow.isDestroyed()) return;
  await splashWindow.webContents.executeJavaScript(
    `window.setStartupStatus(${JSON.stringify(message)})`,
  );
}

async function closeSplashWindow() {
  if (!splashWindow || splashWindow.isDestroyed()) return;
  const capturePath = process.env.RUTA_EXPO_ELECTRON_SPLASH_CAPTURE;
  if (capturePath) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const capture = await splashWindow.webContents.capturePage();
    writeFileSync(capturePath, capture.toPNG());
  }
  splashWindow.destroy();
  splashWindow = undefined;
}

function findPort(start = 3210, end = 3220) {
  return new Promise((resolve, reject) => {
    const tryPort = (port) => {
      if (port > end) return reject(new Error(`No hay un puerto local libre entre ${start} y ${end}.`));
      const probe = createServer();
      probe.once("error", () => tryPort(port + 1));
      probe.once("listening", () => probe.close(() => resolve(port)));
      probe.listen(port, "127.0.0.1");
    };
    tryPort(start);
  });
}

function waitForHealth(port, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (serverProcess?.exitCode !== null) return reject(new Error(`El servidor local terminó con código ${serverProcess.exitCode}.`));
      const request = http.get(`http://127.0.0.1:${port}/api/expo/health`, { timeout: 2_000 }, (response) => {
        let body = "";
        response.on("data", (chunk) => { body += chunk; });
        response.on("end", () => {
          try {
            if (response.statusCode === 200 && JSON.parse(body).ok) return resolve();
          } catch {}
          retry();
        });
      });
      request.on("timeout", () => request.destroy());
      request.on("error", retry);
    };
    const retry = () => Date.now() >= deadline
      ? reject(new Error("La aplicación no superó el control de salud local en 60 segundos."))
      : setTimeout(attempt, 400);
    attempt();
  });
}

function stopServer() {
  if (serverProcess && serverProcess.exitCode === null) serverProcess.kill("SIGTERM");
  serverProcess = undefined;
}

async function runSmoke(window, integrity, port, expoRoot) {
  const snapshot = JSON.parse(readFileSync(path.join(expoRoot, "app", "public", "expo", "snapshot.json"), "utf8"));
  const paths = [
    "/", "/estaciones", "/artesanas", "/productos", "/explorar", "/imperdibles",
    "/buscar?q=telar", "/favoritos", "/agenda", "/mapa", "/recorridos",
    `/estaciones/${snapshot.data.stations[0].slug}`,
    `/artesanas/${snapshot.data.artisans[0].slug}`,
    `/productos/${snapshot.data.products[0].slug}`,
    `/explorar/${snapshot.data.experiences[0].slug}`,
    `/imperdibles/${snapshot.data.highlightSpots[0].slug}`,
  ];
  const journeyStation = snapshot.data.stations.find((station) =>
    [...snapshot.data.artisans, ...snapshot.data.experiences, ...snapshot.data.highlightSpots]
      .some((item) => item.stationRecordId && item.stationRecordId === station.recordId),
  );
  if (journeyStation) paths.push(`/recorridos/recorrido-${journeyStation.slug}`);
  const pathResults = await window.webContents.executeJavaScript(`Promise.all(${JSON.stringify(paths)}.map(async (path) => {
    const response = await fetch(path);
    return { path, ok: response.ok, status: response.status };
  }))`);
  const corePathsOk = pathResults.every((result) => result.ok);
  const renderedPaths = ["/", "/mapa", journeyStation ? `/recorridos/recorrido-${journeyStation.slug}` : "/recorridos"];
  let departmentImagesLoaded = false;
  let vectorMapLoaded = false;
  for (const route of renderedPaths) {
    await window.loadURL(`http://127.0.0.1:${port}${route}`);
    const hasContent = await window.webContents.executeJavaScript("document.body.innerText.trim().length > 100");
    if (!hasContent) throw new Error(`La ruta ${route} no renderizó contenido suficiente.`);
    if (route === "/") {
      departmentImagesLoaded = await window.webContents.executeJavaScript(`new Promise((resolve) => {
        const deadline = Date.now() + 15000;
        const check = () => {
          const images = [...document.querySelectorAll('img[alt^="Departamento "]')];
          if (images.length === 3 && images.every((image) => image.complete && image.naturalWidth > 0)) return resolve(true);
          if (Date.now() >= deadline) return resolve(false);
          setTimeout(check, 100);
        };
        check();
      })`);
      if (!departmentImagesLoaded) throw new Error("Las imágenes de departamentos no cargaron dentro de Electron.");
    }
    if (route === "/mapa") {
      vectorMapLoaded = await window.webContents.executeJavaScript(`new Promise((resolve) => {
        const deadline = Date.now() + 20000;
        const check = () => {
          const map = document.querySelector('.leaflet-container');
          const canvases = [...document.querySelectorAll('.expo-vector-basemap canvas.leaflet-tile')];
          if (map?.dataset.expoMapSource === 'pmtiles' && canvases.some((canvas) => canvas.width > 0 && canvas.height > 0)) {
            return resolve(true);
          }
          if (Date.now() >= deadline) return resolve(false);
          setTimeout(check, 100);
        };
        check();
      })`);
      if (!vectorMapLoaded) throw new Error("El mapa vectorial PMTiles no cargó dentro de Electron.");
    }
  }
  const title = await window.webContents.executeJavaScript("document.title");
  const externalBlocked = await window.webContents.executeJavaScript(
    "fetch('https://example.invalid/ruta-expo-probe').then(() => false).catch(() => true)",
  );
  const report = {
    ok: title.includes("Ruta del Telar") && corePathsOk && departmentImagesLoaded && externalBlocked
      && vectorMapLoaded && blockedRequests > 0 && splashShown && splashStageCount >= 4,
    title,
    localUrlAllowed: isAllowedUrl(`http://127.0.0.1:${port}/`, port),
    externalBlocked,
    blockedRequests,
    corePaths: pathResults.length,
    corePathsOk,
    renderedPaths,
    departmentImagesLoaded,
    vectorMapLoaded,
    splashShown,
    splashStageCount,
    integrity,
  };
  const reportPath = process.env.RUTA_EXPO_ELECTRON_REPORT;
  if (reportPath) writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  if (!report.ok) throw new Error(`Autodiagnóstico Electron falló: ${JSON.stringify(report)}`);
  app.exit(0);
}

async function start() {
  const singleInstance = app.requestSingleInstanceLock();
  if (!singleInstance) return app.quit();
  app.on("second-instance", () => {
    const activeWindow = mainWindow || splashWindow;
    if (activeWindow) { activeWindow.restore(); activeWindow.focus(); }
  });

  await app.whenReady();
  await createSplashWindow();
  await updateSplash("Verificando los archivos de la exposición…");
  const distributionRoot = path.dirname(process.execPath);
  const expoRoot = process.env.RUTA_EXPO_PACKAGE_PATH || path.join(process.resourcesPath, "expo");
  const integrity = await verifyElectronDistribution(distributionRoot);
  await updateSplash("Preparando el servidor local…");
  const port = await findPort();
  const runtime = path.join(expoRoot, "runtime", "node.exe");
  const appRoot = path.join(expoRoot, "app");
  const logs = path.join(app.getPath("userData"), "logs");
  mkdirSync(logs, { recursive: true });
  const stdout = openSync(path.join(logs, "expo-server.out.log"), "a");
  const stderr = openSync(path.join(logs, "expo-server.err.log"), "a");

  serverProcess = spawn(runtime, ["server.js"], {
    cwd: appRoot,
    env: {
      ...process.env,
      RUTA_EXPO_OFFLINE: "true",
      NEXT_TELEMETRY_DISABLED: "1",
      HOSTNAME: "127.0.0.1",
      PORT: String(port),
    },
    stdio: ["ignore", stdout, stderr],
    windowsHide: true,
  });
  await updateSplash("Cargando contenidos e imágenes…");
  await waitForHealth(port);

  const expoSession = session.fromPartition("ruta-del-telar-expo", { cache: true });
  installNetworkPolicy(expoSession, port, () => { blockedRequests += 1; });
  mainWindow = new BrowserWindow({
    title: "Ruta del Telar - Expo",
    show: false,
    fullscreen: process.env.RUTA_EXPO_ELECTRON_SMOKE !== "true",
    autoHideMenuBar: true,
    icon: applicationIcon,
    backgroundColor: "#f7f1e8",
    webPreferences: {
      session: expoSession,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-navigate", (event, target) => {
    if (!isAllowedUrl(target, port)) { event.preventDefault(); blockedRequests += 1; }
  });
  mainWindow.on("closed", () => { mainWindow = undefined; if (!isQuitting) app.quit(); });
  await mainWindow.loadURL(`http://127.0.0.1:${port}/`);
  await updateSplash("Abriendo Ruta del Telar…");
  await closeSplashWindow();

  if (process.env.RUTA_EXPO_ELECTRON_SMOKE === "true") await runSmoke(mainWindow, integrity, port, expoRoot);
  else mainWindow.show();
}

app.on("before-quit", () => { isQuitting = true; stopServer(); });
app.on("window-all-closed", () => app.quit());

start().catch((error) => {
  stopServer();
  if (splashWindow && !splashWindow.isDestroyed()) splashWindow.destroy();
  const message = error instanceof Error ? error.stack || error.message : String(error);
  if (app.isReady()) dialog.showErrorBox("Ruta del Telar Expo no pudo iniciar", message);
  else console.error(message);
  app.exit(1);
});
