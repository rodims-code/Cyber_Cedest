/**
 * scripts/optimize-images.mjs
 * Usage : node scripts/optimize-images.mjs
 *
 * Redimensionne et convertit en WebP les images sources JPEG/PNG de public/.
 * Les originaux ne sont PAS supprimés.
 * Les WebP sont écrits côte à côte des originaux (même dossier, extension .webp).
 */

import sharp from "sharp";
import { stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const IMAGES = [
  { src: "public/images/hero-cyber-cedest.jpg", maxWidth: 1600 },
  { src: "public/images/services/bureautique.jpg", maxWidth: 1000 },
  { src: "public/images/services/wifi-mikrotik.jpg", maxWidth: 1000 },
  { src: "public/images/services/energie-solaire.jpg", maxWidth: 1000 },
  { src: "public/images/services/formation.jpg", maxWidth: 1000 },
  { src: "public/images/gallery/antenne-relais.jpg", maxWidth: 1000 },
  { src: "public/images/gallery/installation-panneaux.jpg", maxWidth: 1000 },
  { src: "public/images/gallery/espace-cyber.jpg", maxWidth: 1000 },
  { src: "public/images/gallery/session-formation.jpg", maxWidth: 1000 },
  { src: "public/images/logo.png", maxWidth: 400 },
  { src: "public/images/logo1.png", maxWidth: 400 },
];

function fmt(bytes) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} Mo`;
  return `${(bytes / 1_024).toFixed(1)} Ko`;
}

async function optimise({ src, maxWidth }) {
  const srcPath = join(ROOT, src);
  const dest = src.replace(/\.(jpe?g|png)$/i, ".webp");
  const destPath = join(ROOT, dest);
  const before = (await stat(srcPath)).size;
  const meta = await sharp(srcPath, { failOn: "warning" }).metadata();

  if (!meta.width || !meta.height) {
    throw new Error("dimensions d'image absentes");
  }

  await sharp(srcPath, { failOn: "warning" }).stats();
  await sharp(srcPath, { failOn: "warning" })
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(destPath);

  const after = (await stat(destPath)).size;
  const maxBytes = src.includes("hero-cyber-cedest") ? 250 * 1024 : 150 * 1024;
  const reduction = Math.round((1 - after / before) * 100);

  return { src, dest, before, after, reduction, outWidth: Math.min(maxWidth, meta.width), maxBytes };
}

console.log("Optimisation des images en cours...\n");

console.log(
  `${"Source".padEnd(42)} ${"Avant".padStart(10)} ${"Après".padStart(10)} ${"Gain".padStart(7)}`
);
console.log("-".repeat(75));

let totalBefore = 0;
let totalAfter = 0;
let failures = 0;

for (const image of IMAGES) {
  try {
    const result = await optimise(image);
    totalBefore += result.before;
    totalAfter += result.after;
    console.log(
      `${result.src.replace("public/images/", "").padEnd(42)} ${fmt(result.before).padStart(10)} ${fmt(result.after).padStart(10)} ${`-${result.reduction}%`.padStart(7)}`
    );
    if (result.after > result.maxBytes) {
      failures += 1;
      console.error(`  ⚠ Dépassement de la cible (${fmt(result.maxBytes)}) : ${result.dest}`);
    }
  } catch (error) {
    failures += 1;
    console.error(`Échec, image ignorée : ${image.src} — ${error.message}`);
  }
}

console.log("-".repeat(75));
console.log(
  `${"TOTAL (images optimisées)".padEnd(42)} ${fmt(totalBefore).padStart(10)} ${fmt(totalAfter).padStart(10)} ${`-${Math.round((1 - totalAfter / totalBefore) * 100)}%`.padStart(7)}`
);
console.log(`\n${failures ? `${failures} image(s) à corriger.` : "Optimisation terminée."} Les originaux sont conservés.`);

if (failures) process.exitCode = 1;
