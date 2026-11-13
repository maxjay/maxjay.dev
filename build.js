// node build.js
// Reads entries.js and writes every page to dist/ as plain HTML. No dependencies.

import { execSync } from 'node:child_process';
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { entries, site } from './entries.js';

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad = (n) => String(n).padStart(2, '0');

function fnv(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

// A 4 by 4 mark: one cell per bit of the name's hash.
function glyph(name, attrs = 'class="glyph" aria-hidden="true"') {
  const h = fnv(name);
  let cells = '';
  for (let i = 0; i < 16; i++) if ((h >>> i) & 1) cells += `<rect x="${i % 4}" y="${i >> 2}" width="1" height="1"/>`;
  return `<svg ${attrs} viewBox="0 0 4 4" shape-rendering="crispEdges">${cells}</svg>`;
}

// Colour: hash a name into 1 of 12 hue slots. If the slot is taken, take the next free one.
function hues(names) {
  const used = new Set(), out = {};
  for (const n of names) {
    if (n in out) continue;
    let slot = Math.floor(((fnv(n) >>> 8) % 360) / 30);
    while (used.has(slot)) slot = (slot + 1) % 12;
    used.add(slot);
    out[n] = slot * 30;
  }
  return out;
}
const hue = hues(entries.map((e) => e.name));
const langHue = hues(entries.map((e) => e.lang).filter(Boolean));
const stateHue = { active: 150, private: 50 }; // these 2 mean something, so they are fixed

const tint = (text, h) => (h == null ? esc(text) : `<span class="tint hue" style="--h:${h}">${esc(text)}</span>`);

const SYMBOLS = '!#$%&*+/<=>?@\\^~';
// Fixed symbols per word, so the same input always builds the same page. app.js reshuffles them in the browser.
function censor(word) {
  let out = '';
  for (let i = 0, at = fnv(word); i < word.length; i++, at = fnv(out)) {
    let s = SYMBOLS[at % SYMBOLS.length];
    if (s === out.at(-1)) s = SYMBOLS[(at + 1) % SYMBOLS.length];
    out += s;
  }
  return out;
}
const fmt = (text) => esc(text)
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/\{(\w+)\}/g, (_, w) => `<span class="cz" role="img" aria-label="censored">${esc(censor(w))}</span>`);
const plain = (text) => text.replace(/\*/g, '').replace(/\{(\w+)\}/g, (_, w) => censor(w));
const label = (href) => href.replace(/^https?:\/\//, '').replace(/\/$/, '');

// The stamp is the commit this build came from.
// Cloudflare's build passes the commit in WORKERS_CI_COMMIT_SHA. Locally, ask git.
let commit = (process.env.WORKERS_CI_COMMIT_SHA ?? '').slice(0, 7);
if (!commit) try { commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch {}
const stamp = `${entries.length} entries${commit ? `  ·  <a href="${site.repo}/commit/${commit}">${commit}</a>` : ''}`;

const KEYS = {
  index: [['up', 'down', 'move'], ['enter', 'open'], ['esc', 'clear']],
  sheet: [['esc', 'index']],
};
const keys = (kind) => KEYS[kind].map((k) => `<span>${k.slice(0, -1).map((x) => `<kbd>${x}</kbd>`).join('')}${k.at(-1)}</span>`).join('');

function page({ path, title, description, h, here = '', kind, body }) {
  return `<!doctype html>
<html lang="en" class="hue" style="--h:${h}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<link rel="canonical" href="${site.url}${path}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
<script src="/app.js" defer></script>
</head>
<body>
<header class="strip">
  <a class="here" href="/">${glyph(site.name)}${site.name}${here && `<span>/ ${esc(here)}</span>`}</a>
  <div id="stamp">${stamp}</div>
</header>
<main>
${body}
</main>
<footer class="strip"><div class="keys">${keys(kind)}</div></footer>
</body>
</html>
`;
}

function index() {
  const rows = entries.map((e, i) => `
  <li><a class="hue" href="/${e.name}/" data-name="${e.name}" data-h="${hue[e.name]}" style="--h:${hue[e.name]}">
    <span class="n">${pad(i + 1)}</span>
    ${glyph(e.name)}
    <span class="name">${esc(e.name)}</span>
    <span class="line">${fmt(e.line)}</span>
    <span class="lang">${e.lang ? tint(e.lang, langHue[e.lang]) : ''}</span>
    <span class="state">${tint(e.state ?? e.where ?? '', stateHue[e.state])}</span>
  </a></li>`).join('');

  return page({
    path: '/', title: site.name, description: plain(entries.at(-1).line), h: hue[entries[0].name], kind: 'index',
    body: `<div class="ask"><label for="q">/</label><input id="q" autocomplete="off" spellcheck="false" placeholder="type a name"></div>
<ol class="rows" id="rows">${rows}
</ol>
<p class="none" id="none" hidden>No entry with that name.</p>
<div id="big"></div>`,
  });
}

function sheet(e) {
  const rows = [];
  const fact = (name, value) => value && rows.push([name, esc(value)]);
  const links = (hrefs) => `<ul>${hrefs.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  fact('Does', e.does);
  fact('Built on', e.built);
  fact('Works with', e.works);
  if (e.list) rows.push(['Contents', links(e.list.map(([href, note]) => `<a href="${href}">${esc(href.split('/').at(-1))}</a> <span>${esc(note)}</span>`))]);
  if (e.state) rows.push(['State', tint(e.state, stateHue[e.state]) + (e.lang ? `, ${tint(e.lang, langHue[e.lang])}` : '')]);
  fact('Since', e.since);
  fact('Location', e.where);
  const go = (e.links ?? []).map((href) => `<a href="${href}">${esc(label(href))}</a>`);
  if (e.planned) go.unshift(`<span>${e.name}.${site.name} (planned)</span>`);
  if (go.length) rows.push(['Go to', links(go)]);

  return page({
    path: `/${e.name}/`, title: `${e.name} · ${site.name}`, description: plain(e.line), h: hue[e.name], here: e.name, kind: 'sheet',
    body: `<a class="back" href="/">index</a>
<div class="title">${glyph(e.name)}<h1>${esc(e.name)}</h1></div>
<p class="lede">${fmt(e.line)}</p>
${e.text ? `<div class="prose">${e.text.map((t) => `<p>${fmt(t)}</p>`).join('\n')}</div>\n` : ''}<dl class="spec">${rows.map(([dt, dd], i) => `
  <div><span class="n">${pad(i + 1)}</span><dt>${dt}</dt><dd>${dd}</dd></div>`).join('')}
</dl>`,
  });
}

const notFound = page({
  path: '/404', title: `404 · ${site.name}`, description: 'No entry with that name.', h: 30, here: '404', kind: 'sheet',
  body: `<a class="back" href="/">index</a>
<div class="title">${glyph('404')}<h1>404</h1></div>
<p class="lede">No entry with that name.</p>`,
});

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', index());
await writeFile('dist/404.html', notFound);
for (const e of entries) {
  await mkdir(`dist/${e.name}`);
  await writeFile(`dist/${e.name}/index.html`, sheet(e));
}
await writeFile('dist/favicon.svg', glyph(site.name, 'xmlns="http://www.w3.org/2000/svg" fill="#00a6d6"'));
await copyFile('style.css', 'dist/style.css');
await copyFile('app.js', 'dist/app.js');
console.log(`built ${entries.length + 2} pages${commit ? ` at ${commit}` : ''}`);
