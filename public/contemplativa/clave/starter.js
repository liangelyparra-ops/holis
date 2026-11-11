(() => {
  const key = 'portfolio-contemplativa-clave-document-v1';
  const marker = key + '-starter-v1';
  try {
    const themeKey = 'portfolio-contemplativa-clave-theme-v1';
    if (!localStorage.getItem(themeKey + '-dark-default-v1')) {
      localStorage.setItem(themeKey, 'dark');
      localStorage.setItem(themeKey + '-dark-default-v1', '1');
    }
    if (localStorage.getItem(marker)) return;
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : null;
    if (existing && (!Array.isArray(existing.entities) || existing.entities.length)) {
      localStorage.setItem(marker, '1'); return;
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const entities = ['#24aab2', '#aa79c5', '#e39b68'].map((hex, i) => ({
      id: 'starter-' + i, type: 'circle', representation: 'lines',
      x: (i - 1) * 230, y: i === 1 ? 65 : -55, z: 0, scale: 125,
      rotation: i === 1 ? -.35 : .3, seed: 1047 + i * 1400,
      palette: [hex], color: {mode:'custom',hex},
      stroke: { closed: i !== 1, points: [{x:-1,y:.2,z:0},{x:-.5,y:-.35,z:0},{x:.4,y:.35,z:0},{x:1,y:-.15,z:0}] },
      lineWidth: .75, inflate: .35, volume: .35,
      params: {density:96,multiplier:7,deform:.2,frequency:.75,amplitude:.12,spread:1},
      animation: {playing:!reduced,phase:i*.8,speed:.08},
      effective: {modulation:0,proximity:0,sync:0}
    }));
    const zoom = Math.max(.3, Math.min(1, innerWidth / 930, innerHeight / 650));
    const doc = {version:3,groups:[],creationColor:{mode:'aura',hex:'#b6a6e8'},nextFamily:'circle',entities,connections:[],camera:{x:0,y:0,zoom},playing:!reduced};
    localStorage.setItem(key, JSON.stringify(doc));
    localStorage.setItem(marker, '1');
  } catch { /* Leave existing or unavailable storage untouched. */ }
})();
