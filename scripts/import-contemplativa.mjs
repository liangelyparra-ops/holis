import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Import an existing static build without modifying its source project.
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = resolve(process.argv[2] ?? '');
if (!process.argv[2]) throw new Error('Provide the Contemplativa source directory.');
const source = join(sourceRoot, 'public');
const target = join(root, 'public/contemplativa');
const prefix = '/contemplativa';
const textExtensions = /\.(?:html|js|css|webmanifest)$/;
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}
function rebase(text) {
  return text
    .replace(/(["'`(])\/(clave|linea|luz|assets)(?=[/"'`)?#])/g, `$1${prefix}/$2`)
    .replaceAll('href="/"', `href="${prefix}/"`)
    .replaceAll("location.replace('/')", `location.replace('${prefix}/')`)
    .replaceAll('contemplativa-', 'portfolio-contemplativa-');
}
const files = await walk(source);
for (const path of files) {
  const name = relative(source, path);
  if (name === 'clave/sw.js') continue;
  const destination = join(target, name);
  await mkdir(dirname(destination), { recursive: true });
  if (textExtensions.test(path)) {
    let text = rebase(await readFile(path, 'utf8'));
    if (name === 'index.html') {
      text = text.replace('<html lang="es">', '<html lang="en">')
        .replace('<title>Un espacio para explorar</title>', '<title>Contemplativa | Personal visual explorations</title>')
        .replace('    <nav aria-label="Experiencias">', '    <h1 style="font:400 21px/1.3 Georgia,serif;letter-spacing:.02em;margin:26px 0 12px">Contemplativa</h1>\n    <p style="max-width:380px;text-align:center;color:#aaa69f;font:13px/1.8 sans-serif;margin:0 0 16px">I don’t have a fixed definition for Contemplativa yet.<br>I’m leaving room to discover what it might become.<br>Choose a space and see where it takes you.</p>\n    <nav aria-label="Experiences">');
    }
    if (name === 'clave/index.html') text = text.replace('<head>', '<head><script src="/contemplativa/clave/starter.js"></script>');
    if (name === 'linea/index.html' || name === 'luz/index.html') {
      const starters = await readFile(join(root, 'scripts/contemplativa/initial-scenes.js'), 'utf8');
      text = text.replace('showPanel(currentTarget());syncActionAccessibility();syncPlay();syncHistory();resize();render();updateIdleCursor();', starters + '\nshowPanel(currentTarget());syncActionAccessibility();syncPlay();syncHistory();resize();render();updateIdleCursor();');
    }
    await writeFile(destination, text);
  }
  else await copyFile(path, destination);
}
await copyFile(join(root, 'scripts/contemplativa/starter.js'), join(target, 'clave/starter.js'));
// Recompute integrity after changing asset paths. Keep the worker scoped to Clave.
const clave = join(target, 'clave');
const precacheFiles = (await walk(clave)).filter(path => !path.endsWith('/sw.js')).sort();
const assetUrl = path => `${prefix}/clave/${relative(clave, path).split('/').map(encodeURIComponent).join('/')}`;
const template = rebase(await readFile(join(sourceRoot, 'clave/sw.template.js'), 'utf8'));
const integrity = {};
const hash = createHash('sha256').update(template);
for (const path of precacheFiles) {
  const contents = await readFile(path);
  integrity[assetUrl(path)] = 'sha256-' + createHash('sha256').update(contents).digest('base64');
  hash.update(relative(clave, path)).update(contents);
}
integrity[`${prefix}/clave/`] = integrity[`${prefix}/clave/index.html`];
const precache = [`${prefix}/clave/`, ...precacheFiles.map(assetUrl)];
const version = hash.update(JSON.stringify(precache)).digest('hex').slice(0, 20);
await writeFile(join(clave, 'sw.js'), `const VERSION=${JSON.stringify(version)};\nconst PRECACHE=${JSON.stringify(precache)};\nconst INTEGRITY=${JSON.stringify(integrity)};\n${template}`);
console.log(`Imported ${files.length} files to /contemplativa; Clave cache version ${version}.`);
