import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { stat } from 'node:fs/promises';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const compiled = await build({
  stdin: {
    contents: `export { designProjects } from './src/data/designProjects'; export { ProjectDialog, DesignPage } from './src/components/design/DesignPage';`,
    resolveDir: root, loader: 'tsx',
  },
  bundle: true, platform: 'node', format: 'cjs', packages: 'external',
  jsx: 'automatic', write: false, logLevel: 'silent',
  define: { 'import.meta.url': JSON.stringify(new URL('../src/components/design/DesignPage.tsx', import.meta.url).href) },
});
const module = { exports: {} };
new Function('require', 'module', 'exports', compiled.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports);
const { designProjects, ProjectDialog, DesignPage } = module.exports;
const visible = designProjects.filter(project => !project.hidden);
const normalize = text => text.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const textContent = markup => markup.replace(/<[^>]+>/g, ' ').replaceAll('&#x27;', "'").replaceAll('&amp;', '&').replace(/\s+/g, ' ').trim();

test('each case expands the card instead of rendering its preview text again', () => {
  for (const project of visible) {
    const markup = renderToStaticMarkup(React.createElement(ProjectDialog, { project, onClose() {} }));
    const content = normalize(textContent(markup));
    assert.ok(!content.includes(normalize(project.subtitle)), `${project.id}: preview repeated in dialog`);
    const previewOpening = normalize(project.subtitle).split(' ').slice(0, 5).join(' ');
    assert.ok(!normalize(project.description).startsWith(previewOpening), `${project.id}: introduction repeats preview opening`);
    const paragraphs = [...markup.matchAll(/<p(?:\s[^>]*)?>(.*?)<\/p>/gs)].map(match => normalize(textContent(match[1]))).filter(Boolean);
    assert.equal(new Set(paragraphs).size, paragraphs.length, `${project.id}: duplicate paragraph`);
    assert.match(markup, /aria-labelledby="design-project-title"/);
  }
});

test('all visible case media have an accessible description and existing local files', async () => {
  assert.equal(new Set(designProjects.map(project => project.id)).size, designProjects.length);
  for (const project of visible) {
    const media = [...project.media, ...(project.caseStudy?.sections.flatMap(section => section.images ?? []) ?? [])];
    assert.ok(media.length);
    for (const item of media) {
      assert.ok(item.alt?.trim(), `${project.id}: missing media description`);
      if (item.src.startsWith('/')) assert.ok((await stat(join(root, 'public', item.src))).size > 0, item.src);
      else assert.equal(new URL(item.src).protocol, 'https:');
    }
  }
});

test('page hides deferred cases, shows accurate count, and has no links to other portfolios', () => {
  const previousWindow = globalThis.window;
  globalThis.window = { matchMedia: () => ({ matches: true }) };
  let markup;
  try { markup = renderToStaticMarkup(React.createElement(DesignPage)); }
  finally { if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow; }
  assert.equal((markup.match(/class="design-card-button"/g) ?? []).length, visible.length);
  assert.doesNotMatch(markup, /View Bojana Estudio branding|Working in English|agency work/);
  assert.doesNotMatch(markup, /href="(?:\/|\/#multimedia|\/product|\/multimedia)"/);
  const ids = new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const match of markup.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(match[1]), `Broken anchor: ${match[1]}`);
});
