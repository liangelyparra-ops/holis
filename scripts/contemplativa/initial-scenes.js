// Seed a first visit, including empty sessions from before starter compositions existed.
// An intentionally cleared canvas stays empty after this first initialization.
try {
  const marker = sessionKey + '-starter-v1';
  if (!localStorage.getItem(marker)) {
    if (!hasStoredSession || !state.cores.length) {
      if (experience.id === 'lineas') { openChromaticRows(); state.playing = !reduced; syncPlay(); persist(); }
      else if (experience.id === 'luz') {
        state.cores = Array.from({length:5}, (_,i)=>({id:i+1,x:(i-2)*1.15,y:Math.sin(i*1.4)*.85,z:Math.cos(i)*.2,energy:1.1,seed:1147+i*1331,hue:190+i*29,charge:1,phase:i*1.2,form:'light',depth:.9,tilt:.3,spatialVersion:2,motion:'oscilación',speed:.65,amplitude:.4}));
        state.nextId=6; state.playing=!reduced; persist();
      }
    }
    localStorage.setItem(marker,'1');
  }
} catch { /* Do not replace an unavailable or unreadable saved session. */ }
