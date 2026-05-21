#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { minify: minifyHtml } = require('html-minifier-terser');
const CleanCSS = require('clean-css');
const { minify: minifyJs } = require('terser');
const sharp = require('sharp');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://pos.personaltraineracademy.com.br';

const HTML_MINIFY_OPTIONS = {
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  minifyCSS: true,
  minifyJS: true,
  keepClosingSlash: true,
  sortAttributes: true,
  sortClassName: true,
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDist() {
  fs.rmSync(DIST, { recursive: true, force: true });
  ensureDir(path.join(DIST, 'css'));
  ensureDir(path.join(DIST, 'js'));
  ensureDir(path.join(DIST, 'assets'));
  console.log('✓ dist/ limpa e recriada');
}

function buildCss() {
  const source = fs.readFileSync(path.join(ROOT, 'css', 'main.css'), 'utf8');
  const result = new CleanCSS({ level: 2 }).minify(source);

  if (result.errors.length) {
    throw new Error(`CSS: ${result.errors.join(', ')}`);
  }

  fs.writeFileSync(path.join(DIST, 'css', 'main.css'), result.styles);
  const saved = ((1 - result.styles.length / source.length) * 100).toFixed(1);
  console.log(`✓ css/main.css minificado (-${saved}%)`);
}

async function buildJs() {
  const sourcePath = path.join(ROOT, 'js', 'main.js');
  const source = fs.readFileSync(sourcePath, 'utf8').trim();
  const outPath = path.join(DIST, 'js', 'main.js');

  if (!source || source.startsWith('/*')) {
    fs.writeFileSync(outPath, '');
    console.log('✓ js/main.js (vazio — sem lógica JS)');
    return;
  }

  const result = await minifyJs(source, {
    compress: true,
    mangle: true,
    format: { comments: false },
  });

  fs.writeFileSync(outPath, result.code);
  console.log('✓ js/main.js minificado');
}

async function optimizeRafaelAvatar() {
  const input = path.join(ROOT, 'assets', 'rafael.jpg');
  const output = path.join(DIST, 'assets', 'rafael.webp');

  await sharp(input)
    .rotate()
    .resize(320, 320, { fit: 'cover', position: 'top' })
    .webp({ quality: 82, effort: 6 })
    .toFile(output);

  const inSize = fs.statSync(input).size;
  const outSize = fs.statSync(output).size;
  console.log(
    `✓ assets/rafael.webp (${(outSize / 1024).toFixed(1)} KB, era ${(inSize / 1024 / 1024).toFixed(1)} MB)`
  );
}

async function optimizeWebpAsset(filename, maxWidth) {
  const input = path.join(ROOT, 'assets', filename);
  const output = path.join(DIST, 'assets', filename);

  await sharp(input)
    .resize(maxWidth, null, { withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(output);

  const outSize = fs.statSync(output).size;
  console.log(`✓ assets/${filename} (${(outSize / 1024).toFixed(1)} KB)`);
}

async function buildAssets() {
  await optimizeRafaelAvatar();
  await optimizeWebpAsset('mobile.webp', 900);
  await optimizeWebpAsset('web.webp', 1920);
}

function patchHtmlForProduction(html) {
  return html
    .replace(/assets\/rafael\.jpg/g, 'assets/rafael.webp')
    .replace(
      /(<link[^>]*href="assets\/rafael\.webp"[^>]*type=")image\/jpeg(")/i,
      '$1image/webp$2'
    );
}

async function buildHtml() {
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  html = patchHtmlForProduction(html);

  const minified = await minifyHtml(html, HTML_MINIFY_OPTIONS);
  fs.writeFileSync(path.join(DIST, 'index.html'), minified);

  const sourceLen = html.length;
  const saved = ((1 - minified.length / sourceLen) * 100).toFixed(1);
  console.log(`✓ index.html minificado (-${saved}%)`);
}

function printSummary() {
  const walk = (dir, prefix = '') => {
    let total = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        total += walk(full, `${prefix}${entry.name}/`);
      } else {
        const size = fs.statSync(full).size;
        total += size;
        console.log(`  ${prefix}${entry.name} — ${(size / 1024).toFixed(1)} KB`);
      }
    }
    return total;
  };

  console.log('\n📦 dist/ pronta para deploy:');
  const total = walk(DIST);
  console.log(`\n  Total: ${(total / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  URL canônica: ${SITE_URL}\n`);
}

async function main() {
  console.log('\n🔨 Build de produção — Rafael Tonietto\n');
  cleanDist();
  buildCss();
  await buildJs();
  await buildAssets();
  await buildHtml();
  printSummary();
}

main().catch((err) => {
  console.error('\n✗ Build falhou:', err.message);
  process.exit(1);
});
