/*
 * Build the self-contained index.html from src/app.jsx.
 *
 * The deployed page must render with zero external script dependencies (no CDN,
 * no in-browser transpiler), so this script:
 *   1. precompiles the JSX in src/app.jsx to plain JS, and
 *   2. inlines the vendored React + ReactDOM UMD production builds.
 *
 * Usage:  npm install  &&  npm run build
 * Output: index.html  (the file GitHub Pages serves)
 */
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const appJsx = read("src/app.jsx");
const react = read("vendor/react.production.min.js");
const reactDom = read("vendor/react-dom.production.min.js");

const { code: app } = babel.transformSync(appJsx, {
  presets: [["@babel/preset-react", { runtime: "classic" }]],
  compact: false,
});

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>2-Minute AI Security Scorecard — Virtue AI</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  html, body { margin: 0; height: 100%; background: #F9F7F0; }
  #root { min-height: 100%; }
</style>
<!-- GENERATED FILE — do not edit by hand. Edit src/app.jsx and run \`npm run build\`.
     React + ReactDOM (UMD production) are inlined below so the page is fully
     self-contained and renders with no external scripts. -->
<script>${react}</script>
<script>${reactDom}</script>
</head>
<body>
<div id="root"></div>
<script>
${app}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "index.html"), html);
console.log(`Built index.html (${html.length} bytes)`);
