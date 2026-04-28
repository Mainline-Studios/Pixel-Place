import { cpSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const src = join(root, "studio", "dist");
const dest = join(root, "frontend", "public", "pixel-studio");

if (!existsSync(src)) {
  console.error("studio/dist not found. Run: npm run build -w studio");
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("Copied studio build to frontend/public/pixel-studio");
