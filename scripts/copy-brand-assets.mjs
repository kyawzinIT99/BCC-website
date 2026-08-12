import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, ".next", "static", "brand");
mkdirSync(outDir, { recursive: true });

const assets = [
  ["public/bccwa-logo.jpg", "bccwa-logo.jpg"],
  ["public/favicon.png", "favicon.png"],
];

for (const [from, name] of assets) {
  const source = join(root, from);
  if (!existsSync(source)) {
    console.warn(`[copy-brand-assets] missing ${from}`);
    continue;
  }
  copyFileSync(source, join(outDir, name));
  console.log(`[copy-brand-assets] ${name}`);
}
