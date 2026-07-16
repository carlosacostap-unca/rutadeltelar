import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const cwd = process.cwd();
const source = path.join(cwd, "public", "images", "home", "footer-vicuna.png");
const targetDirectory = path.join(cwd, "electron", "assets");
const pngPath = path.join(targetDirectory, "app-icon.png");
const icoPath = path.join(targetDirectory, "app-icon.ico");

await mkdir(targetDirectory, { recursive: true });

const background = Buffer.from(`
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#174d6d"/>
        <stop offset="1" stop-color="#082d49"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="112" fill="url(#bg)"/>
    <rect x="14" y="14" width="484" height="484" rx="101" fill="none" stroke="#efd4b0" stroke-width="12"/>
  </svg>
`);
const vicuna = await sharp(source)
  .resize({
    width: 270,
    height: 370,
    fit: "contain",
    withoutEnlargement: false,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

await sharp(background)
  .composite([{ input: vicuna, gravity: "center" }])
  .png()
  .toFile(pngPath);
await writeFile(icoPath, await pngToIco(pngPath));

console.log(`Electron PNG icon: ${pngPath}`);
console.log(`Electron ICO icon: ${icoPath}`);
