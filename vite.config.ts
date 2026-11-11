import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), {
      name: 'contemplativa-static-routes',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'GET' && ['/__record-previews/clave', '/__record-previews/clave.js'].includes(req.url ?? '')) {
            const html = await readFile(path.resolve('public/contemplativa/clave/index.html'), 'utf8');
            const modulePath = html.match(/src="(\/contemplativa\/clave\/assets\/index-[^"]+\.js)"/)![1];
            if (req.url === '/__record-previews/clave') {
              res.setHeader('Content-Type', 'text/html');
              res.end(html.replace('/contemplativa/clave/starter.js', '/scripts/clave-preview-scene.js').replace(modulePath, '/__record-previews/clave.js'));
            } else {
              const source = await readFile(path.resolve('public' + modulePath), 'utf8');
              res.setHeader('Content-Type', 'text/javascript');
              res.end(source.replaceAll('portfolio-contemplativa-', 'portfolio-recording-clave-').replace('function Ki(){', 'function Ki(){return;'));
            }
            return;
          }
          if (req.url === '/__record-previews' && req.method === 'GET') {
            res.setHeader('Content-Type', 'text/html');
            res.end(await readFile(path.resolve('scripts/preview-recorder.html')));
            return;
          }
          if (!req.url?.startsWith('/__record-previews/save?')) return next();
          const name = new URL(req.url, 'http://localhost').searchParams.get('name');
          if (req.method !== 'POST' || !['contemplativa', 'papelito', 'contemplativa-poster', 'papelito-poster'].includes(name ?? '') || req.headers.origin !== `http://${req.headers.host}`) {
            res.statusCode = 403; res.end('Not allowed'); return;
          }
          const chunks: Buffer[] = []; let length = 0;
          for await (const chunk of req) {
            length += chunk.length;
            if (length > 12_000_000) { res.statusCode = 413; res.end('Too large'); return; }
            chunks.push(chunk);
          }
          await mkdir(path.resolve('public/design/previews'), { recursive: true });
          await writeFile(path.resolve(`public/design/previews/${name}.${name?.endsWith('-poster') ? 'png' : 'webm'}`), Buffer.concat(chunks));
          res.end('Saved');
        });
        server.middlewares.use((req, _res, next) => {
          const [rawPath, query] = (req.url ?? '').split('?');
          const pathname = rawPath.replace(/\/{2,}/g, '/');
          if (/^\/contemplativa(?:\/(?:clave|linea|luz))?\/?$/.test(pathname)) {
            req.url = pathname.replace(/\/$/, '') + '/index.html' + (query ? '?' + query : '');
          }
          next();
        });
      },
    }],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // Multi-page app: portfolio (index.html) + standalone game (game.html)
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          game: path.resolve(__dirname, 'game.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
