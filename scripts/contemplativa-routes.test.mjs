import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDirectory = join(root, 'public');

test('Contemplativa entry points keep their navigation and resources inside their own route', async () => {
  for (const name of ['', 'clave/', 'linea/', 'luz/']) {
    const html = await readFile(join(publicDirectory, 'contemplativa', name, 'index.html'), 'utf8');
    assert.doesNotMatch(html, /(?:href|src)="\/(?:clave|linea|luz|assets)(?:\/|")|href="\/"/);
    for (const [, url] of html.matchAll(/(?:href|src)="(\/contemplativa[^"?#]*)"/g)) {
      let path = join(publicDirectory, url);
      if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
      assert.ok((await stat(path)).size > 0, url);
    }
    if (name === 'linea/' || name === 'luz/') {
      assert.match(html, /portfolio-contemplativa-/);
      assert.doesNotMatch(html, /["']contemplativa-/);
    }
  }
});

test('Clave offline resources match their integrity and stay scoped to the copied experience', async () => {
  const manifest = JSON.parse(await readFile(join(publicDirectory, 'contemplativa/clave/manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.scope, '/contemplativa/clave/');
  assert.equal(manifest.start_url, '/contemplativa/clave/');
  const sw = await readFile(join(publicDirectory, 'contemplativa/clave/sw.js'), 'utf8');
  const precache = JSON.parse(sw.match(/const PRECACHE=(.*);/)[1]);
  const integrity = JSON.parse(sw.match(/const INTEGRITY=(.*);/)[1]);
  assert.match(sw, /portfolio-contemplativa-clave-pwa-/);
  for (const url of precache) {
    assert.ok(url.startsWith('/contemplativa/clave/'), url);
    const path = join(publicDirectory, url.endsWith('/') ? `${url}index.html` : url);
    const expected = 'sha256-' + createHash('sha256').update(await readFile(path)).digest('base64');
    assert.equal(integrity[url], expected, url);
  }
});
