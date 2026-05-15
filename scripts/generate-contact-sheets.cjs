const fs = require("fs");
const path = require("path");

const VIEWPORTS = ["mobile-375", "mobile-430", "tablet-768", "desktop-1440"];
const BASE = "reports/visual/pass4-audit";

function css() {
  return `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a1a;color:#e0e0e0;font-family:monospace;padding:20px}
h1{font-size:20px;margin-bottom:16px;color:#a0a0ff}
h2{font-size:18px;margin:24px 0 12px;color:#a0a0ff;border-top:1px solid #2a2a4a;padding-top:20px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
.card{background:#14142a;border:1px solid #2a2a4a;border-radius:8px;overflow:hidden}
.card img{width:100%;display:block;border-bottom:1px solid #2a2a4a}
.card .label{padding:8px 10px;font-size:11px;color:#a0a0c0;word-break:break-all}
</style>`;
}

for (const vp of VIEWPORTS) {
  const dir = path.join(BASE, vp);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
  if (files.length === 0) {
    console.log(`  [skip] ${vp}: no screenshots found`);
    continue;
  }

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8">${css()}</head><body>`;
  html += `<h1>Contact sheet &mdash; ${vp} (${files.length} screenshots)</h1><div class="grid">`;
  for (const f of files) {
    html += `<div class="card"><img src="./${vp}/${f}" alt="${f}"><div class="label">${f}</div></div>`;
  }
  html += `</div></body></html>`;

  fs.writeFileSync(path.join(BASE, `contact-${vp}.html`), html);
  console.log(`Created contact-${vp}.html (${files.length} images)`);
}

// All-viewport combined
let allHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">${css()}</head><body>`;
allHtml += `<h1>Contact sheet &mdash; all viewports</h1>`;
for (const vp of VIEWPORTS) {
  const dir = path.join(BASE, vp);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
  if (files.length === 0) continue;
  allHtml += `<h2 id="${vp}">${vp} (${files.length})</h2><div class="grid">`;
  for (const f of files) {
    allHtml += `<div class="card"><img src="./${vp}/${f}" alt="${f}"><div class="label">${f}</div></div>`;
  }
  allHtml += `</div>`;
}
allHtml += `</body></html>`;
fs.writeFileSync(path.join(BASE, "contact-all.html"), allHtml);
console.log("Created contact-all.html");
