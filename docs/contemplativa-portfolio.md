# Contemplativa in the portfolio

The personal explorations section links to `/contemplativa`. Its landing, Clave,
Línea and Luz are a self-contained copy of the existing Contemplativa static build.
They do not redirect visitors to Product or to bojana.store.

To refresh this copy, first verify the source project's static build, then run:

```
node scripts/import-contemplativa.mjs /absolute/path/to/contemplativa
```

The importer reads the source without changing it. It prefixes resource paths and
navigation with `/contemplativa`, keeps local storage separate using
`portfolio-contemplativa-`, and regenerates Clave's scoped offline cache integrity.
The landing adds brief introductory text for portfolio visitors. It does not
change the drawing tools or copy saved artwork from another origin.

Each experience starts with an editable composition on a first visit. Existing
artwork and intentionally cleared canvases are preserved. The intro leaves the
project’s eventual direction open. The card uses a continuous recording of moving Clave strokes on a dark canvas. The recording uses the same Clave renderer with an isolated composition and storage namespace. Papelito shows its home,
lobby, round and results screens using the real renderer with sample players,
without live database effects. Both videos have
pause controls and respect reduced motion. The experiences remain in development.

Checks: `node --test scripts/contemplativa-routes.test.mjs scripts/design-content.test.mjs`.
