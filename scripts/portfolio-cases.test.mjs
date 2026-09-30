import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import express from 'express';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const result = await build({
  stdin: {
    contents: `
      export { useCases } from './src/data/useCases';
      export * from './src/data/caseStudyDemos';
      export { CaseVisual, CookieLivePrototypeBlock } from './src/components/portfolio/CustomCaseBlocks';
      export { CaseStudyCard } from './src/components/portfolio/CaseStudyCard';
      export { CaseStudyModal } from './src/components/portfolio/CaseStudyModal';
      export { default as App } from './src/App';
    `,
    resolveDir: root,
    sourcefile: 'portfolio-test-entry.tsx',
    loader: 'tsx',
  },
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  jsx: 'automatic',
  write: false,
  logLevel: 'silent',
});
const module = { exports: {} };
const require = createRequire(join(root, 'portfolio-test-entry.cjs'));
new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports);
const {
  useCases, createCookieDemoState, cookieDemoReducer, canApproveCookie,
  CaseVisual, CookieLivePrototypeBlock, CaseStudyCard, CaseStudyModal, App,
} = module.exports;
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));

test('three distinct cases have complete narrative, attribution and illustrative material', () => {
  assert.deepEqual(useCases.map(project => project.id), [
    'bigid_ai_cookie_classification', 'bigid_scaling_to_enterprise',
    'illow_brand_system',
  ]);
  assert.equal(new Set(useCases.map(project => project.visualType)).size, 3);
  for (const project of useCases) {
    assert.ok(project.role && project.context && project.evidenceNote);
    assert.equal(project.metrics, undefined);
    assert.equal(project.blocks.filter(block => block.type === 'text').length, 5);
    assert.ok(project.blocks.some(block => block.customType === project.visualType));
    assert.match(project.blocks.at(-1).title, /validate next/);
    assert.doesNotMatch(JSON.stringify(project), /\d+(?:\.\d+)?\s*%|3x faster|10x volume|zero latency/i);
  }
});

test('cookie demo requires loading, preserves per-field origin and approves explicitly', () => {
  const initial = createCookieDemoState();
  assert.equal(canApproveCookie(initial), false);
  assert.equal(cookieDemoReducer(initial, { type: 'approve' }), initial);
  assert.equal(cookieDemoReducer(initial, { type: 'edit', field: 'vendor', value: 'Ignored' }), initial);
  const review = cookieDemoReducer(initial, { type: 'load' });
  assert.equal(review.stage, 'review');
  const edited = cookieDemoReducer(review, { type: 'edit', field: 'vendor', value: 'Corrected example' });
  assert.deepEqual(edited.edited, { vendor: true });
  assert.equal(edited.values.category, review.values.category);
  assert.equal(edited.values.description, review.values.description);
  assert.equal(initial.edited.vendor, undefined);
  const approved = cookieDemoReducer(edited, { type: 'approve' });
  assert.equal(approved.stage, 'approved');
  assert.equal(approved.values.vendor, 'Corrected example');
  assert.equal(cookieDemoReducer(approved, { type: 'edit', field: 'category', value: 'Ignored' }), approved);
  assert.equal(cookieDemoReducer(approved, { type: 'load' }), approved);
  assert.deepEqual(cookieDemoReducer(approved, { type: 'reset' }), initial);
});

test('cookie demo rejects blank fields; editing back does not erase manual origin', () => {
  const review = cookieDemoReducer(createCookieDemoState(), { type: 'load' });
  const blank = cookieDemoReducer(review, { type: 'edit', field: 'category', value: '   ' });
  assert.equal(canApproveCookie(blank), false);
  assert.equal(cookieDemoReducer(blank, { type: 'approve' }), blank);
  const restored = cookieDemoReducer(blank, { type: 'edit', field: 'category', value: review.values.category });
  assert.equal(restored.edited.category, true);
  assert.equal(canApproveCookie(restored), true);
  const other = createCookieDemoState();
  other.values.vendor = 'Separate demo';
  assert.notEqual(createCookieDemoState().values.vendor, other.values.vendor);
});

test('cards and detailed cases render with labels and appropriate media', () => {
  for (const [index, project] of useCases.entries()) {
    const card = render(CaseStudyCard, { project, idx: index, onOpen: () => {} });
    assert.match(card, /Illustrative/);
    assert.match(card, /Read case study/);
    assert.doesNotMatch(card, /<iframe|<img/);
    const modal = render(CaseStudyModal, { project, onClose: () => {} });
    assert.match(modal, /role="dialog"/);
    assert.match(modal, /aria-modal="true"/);
    assert.match(modal, /About the material shown/);
    assert.match(modal, /What I would validate next/);
    for (const compact of [true, false]) {
      const visual = render(CaseVisual, { type: project.visualType, compact });
      assert.match(visual, /<figcaption[^>]*>Illustrative/);
    }
  }
  assert.equal(render(CaseStudyModal, { project: null, onClose: () => {} }), '');
});

test('external prototype is embedded directly and asset images render inside the use case', () => {
  const prototype = render(CookieLivePrototypeBlock, { url: useCases[0].liveUrl });
  assert.match(prototype, /Open prototype in a new tab/);
  assert.match(prototype, /<iframe/);
  assert.match(prototype, /Interactive design prototype/);
  const brand = useCases.at(-1);
  const html = render(CaseStudyModal, { project: brand, onClose: () => {} });
  assert.match(html, /<img/);
  assert.doesNotMatch(html, /Existing asset references/);
});

test('Home renders selected-work cards and preserves CV/contact integration', () => {
  const html = render(App);
  assert.equal((html.match(/Read case study →/g) || []).length, 3);
  assert.match(html, /Senior Product Designer/);
  assert.match(html, /I make complex systems understandable/);
  assert.match(html, /\/resume\/lia-parra-resume.pdf/);
  assert.match(html, /mailto:liangelyp@gmail.com/);
});

test('static fallback and structured data match the three React cases', async () => {
  const html = await readFile(join(root, 'index.html'), 'utf8');
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(json, 'structured data must be present');
  const graph = JSON.parse(json[1])['@graph'];
  const list = graph.find(item => item['@type'] === 'ItemList');
  assert.deepEqual(list.itemListElement.map(item => item.item.name), useCases.map(project => project.title));
  for (const project of useCases) assert.ok(html.includes(project.title), project.title);
  assert.equal((html.match(/<article /g) || []).length, 3);
});

test('compiled Home, referenced assets and unchanged public CV are served over HTTP', { timeout: 30000 }, async () => {
  const app = express();
  app.use(express.static(join(root, 'dist')));
  const server = createServer(app);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(base, { signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<div id="root">/);
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(match => match[1]);
    assert.ok(assets.length > 0, 'build must expose compiled assets');
    for (const asset of assets) assert.equal((await fetch(base + asset, { signal: AbortSignal.timeout(5000) })).status, 200, asset);
    const resume = await fetch(base + '/resume/lia-parra-resume.pdf', { signal: AbortSignal.timeout(5000) });
    assert.equal(resume.status, 200);
    assert.match(resume.headers.get('content-type'), /application\/pdf/);
    assert.deepEqual(Buffer.from(await resume.arrayBuffer()), await readFile(join(root, 'public/resume/lia-parra-resume.pdf')));
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});