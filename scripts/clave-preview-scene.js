// Recording-only artwork and storage. The visitor's Clave composition stays intact.
(() => {
  const curves = [
    [[-1.6,.35],[-1.1,-.7],[-.45,-.85],[.1,.15],[.8,.75],[1.55,-.2]],
    [[-1.6,-.3],[-.95,.65],[-.15,.55],[.25,-.45],[.95,-.7],[1.6,.25]],
    [[-1.5,.45],[-.85,.7],[-.2,-.55],[.55,-.65],[1.25,.4],[1.65,.15]],
  ];
  const colors = ['#69c9ca', '#ba95da', '#e8b18c'];
  const entities = curves.map((points,i) => ({
    id:'preview-stroke-'+i, type:'circle', representation:'lines',
    x:(i-1)*55, y:(i-1)*105, z:0, scale:205, rotation:(i-1)*.1,
    seed:1047+i*1400, palette:[colors[i]], color:{mode:'custom',hex:colors[i]},
    stroke:{closed:false,points:points.map(([x,y])=>({x,y,z:0}))},
    lineWidth:.65, inflate:.55, volume:.55,
    params:{density:72,multiplier:7,deform:.25,frequency:.75,amplitude:.2,spread:1.1},
    animation:{playing:true,phase:i*.8,speed:.22},
    effective:{modulation:0,proximity:0,sync:0},
  }));
  localStorage.setItem('portfolio-recording-clave-clave-theme-v1','dark');
  localStorage.setItem('portfolio-recording-clave-clave-document-v1',JSON.stringify({
    version:3,groups:[],entities,connections:[],camera:{x:0,y:0,zoom:.92},playing:true,
    creationColor:{mode:'aura',hex:'#b6a6e8'},nextFamily:'circle',
  }));
})();
