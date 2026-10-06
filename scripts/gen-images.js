const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "products");
fs.mkdirSync(outDir, { recursive: true });

const palettes = {
  suits: ["#7c3aed", "#a855f7"],
  "bridal-wear": ["#be185d", "#f472b6"],
  fabric: ["#0f766e", "#2dd4bf"],
  clutches: ["#b45309", "#fbbf24"],
  shawls: ["#1d4ed8", "#60a5fa"],
  unstitched: ["#065f46", "#34d399"],
};

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function svg(name, sub, colorA, colorB, seed) {
  name = esc(name);
  sub = esc(sub);
  const patternId = `p${seed}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100">
  <defs>
    <linearGradient id="g${seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colorA}"/>
      <stop offset="100%" stop-color="${colorB}"/>
    </linearGradient>
    <pattern id="${patternId}" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(${(seed * 13) % 60})">
      <circle cx="30" cy="30" r="${8 + (seed % 5)}" fill="white" fill-opacity="0.07"/>
    </pattern>
  </defs>
  <rect width="900" height="1100" fill="url(#g${seed})"/>
  <rect width="900" height="1100" fill="url(#${patternId})"/>
  <rect x="60" y="60" width="780" height="980" fill="none" stroke="white" stroke-opacity="0.35" stroke-width="2"/>
  <text x="450" y="530" font-family="Georgia, 'Times New Roman', serif" font-size="46" fill="white" text-anchor="middle" font-weight="600">${name}</text>
  <text x="450" y="580" font-family="Arial, sans-serif" font-size="24" fill="white" fill-opacity="0.85" text-anchor="middle" letter-spacing="4">${sub.toUpperCase()}</text>
  <text x="450" y="1030" font-family="Georgia, serif" font-size="30" fill="white" fill-opacity="0.9" text-anchor="middle" letter-spacing="6">BAZAAR PANUN</text>
</svg>`;
}

const products = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "data", "products.seed.json"), "utf8"));

let count = 0;
for (const p of products) {
  const [a, b] = palettes[p.category] || ["#374151", "#9ca3af"];
  p.images.forEach((imgPath, i) => {
    const filename = path.basename(imgPath);
    const filePath = path.join(outDir, filename);
    const label = p.name.length > 22 ? p.name.slice(0, 22) + "…" : p.name;
    const content = svg(label, p.category.replace("-", " "), a, b, count + i);
    fs.writeFileSync(filePath, content);
  });
  count++;
}

console.log(`Generated images for ${products.length} products.`);
