import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcPath = path.join(root, "_gomoku_ai_worker.js.tmp");
const outPath = path.join(root, "features/omok/vendor/gomoku/gomokuEngine.ts");

const src = fs.readFileSync(srcPath, "utf8");
const lines = src.split(/\r?\n/);
const head = lines.slice(0, 977).join("\n");
const tail = lines.slice(1049).join("\n").replace(/^async function findBestMove/m, "function findBestMove");

const license = `// @ts-nocheck
/**
 * Gomoku AI engine — derived from https://github.com/gkoos/gomoku (MIT License).
 * See \`features/omok/vendor/gomoku/LICENSE\` for full license text.
 * Modifications: Web Worker message handler removed; \`progressCallback\` no-op; synchronous export.
 */

`;

const mid = "\nfunction progressCallback() {}\n\n";
const out = `${license}${head}${mid}${tail}\n\nexport { findBestMove };\n`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out);
console.log("Wrote", outPath, "lines:", out.split("\n").length);
