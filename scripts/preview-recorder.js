import {toCanvas} from 'html-to-image';
const output=document.querySelector('#output'),ctx=output.getContext('2d'),frame=document.querySelector('#experience'),status=document.querySelector('#status');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function load(url){await new Promise((resolve,reject)=>{frame.onload=resolve;frame.onerror=reject;frame.src=url});await wait(1000);await frame.contentDocument.fonts.ready;}
function snapshot(source){const target=document.createElement('canvas');target.width=960;target.height=540;const c=target.getContext('2d');c.fillStyle='#090909';c.fillRect(0,0,960,540);const scale=Math.min(960/source.width,540/source.height),w=source.width*scale,h=source.height*scale;c.drawImage(source,(960-w)/2,(540-h)/2,w,h);return target;}
async function record(name,images,liveSource=null){
 const poster=await new Promise(r=>images[1].toBlob(r,'image/png'));
 const posterResponse=await fetch('/__record-previews/save?name='+name+'-poster',{method:'POST',headers:{'Content-Type':'image/png'},body:poster});
 if(!posterResponse.ok)throw Error('Could not save poster');
 const chunks=[],stream=output.captureStream(20),mime=['video/webm;codecs=vp9','video/webm;codecs=vp8'].find(t=>MediaRecorder.isTypeSupported(t));
 const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:1600000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
 const stopped=new Promise(r=>recorder.onstop=r);let running=true,start=performance.now();
 const paint=()=>{const i=Math.min(images.length-1,Math.floor((performance.now()-start)/1900));ctx.drawImage(liveSource??images[i],0,0,960,540);if(running)requestAnimationFrame(paint)};
 paint();recorder.start();await wait(liveSource?10000:images.length*1900);running=false;recorder.stop();await stopped;stream.getTracks().forEach(t=>t.stop());
 const response=await fetch('/__record-previews/save?name='+name,{method:'POST',headers:{'Content-Type':'video/webm'},body:new Blob(chunks,{type:'video/webm'})});if(!response.ok)throw Error(await response.text());status.textContent+='\nSaved '+name;
}
async function recordClave(){
 status.textContent='Recording moving Clave strokes';
 await load('/__record-previews/clave');
 const canvas=frame.contentDocument.querySelector('canvas');
 if(!canvas?.width)throw Error('Clave canvas not ready');
 const first=snapshot(canvas), before=first.getContext('2d').getImageData(0,0,960,540).data;
 await record('contemplativa',[first,first],canvas);
 const after=snapshot(canvas).getContext('2d').getImageData(0,0,960,540).data;
 let changed=0;for(let i=0;i<before.length;i+=4)if(Math.abs(before[i]-after[i])+Math.abs(before[i+1]-after[i+1])+Math.abs(before[i+2]-after[i+2])>12)changed++;
 status.textContent+='\nMotion verified: '+changed+' changed pixels';
 if(changed<100)throw Error('The recorded artwork did not move');
}
document.querySelector('#record-clave').onclick=async()=>{try{
 document.querySelectorAll('button').forEach(b=>b.disabled=true);await recordClave();status.textContent+='\nDONE';
 }catch(error){status.textContent+='\nERROR: '+(error?.message||String(error))}finally{document.querySelectorAll('button').forEach(b=>b.disabled=false)}};
document.querySelector('#record').onclick=async()=>{try{
 document.querySelectorAll('button').forEach(b=>b.disabled=true);await recordClave();
 const stages=[];
 for(const stage of ['HOME','LOBBY','GAME','RESULTS']){
  await load('/scripts/game-preview.html?stage='+stage);await wait(700);
  const doc=frame.contentDocument;const shot=await toCanvas(doc.body,{width:960,height:720,pixelRatio:1,backgroundColor:'#0e0e0e',skipFonts:true});stages.push(snapshot(shot));status.textContent+='\nCaptured '+stage;
 }
 await record('papelito',stages);status.textContent+='\nDONE';
 }catch(error){status.textContent+='\nERROR: '+(error?.message||error?.type||String(error))}finally{document.querySelectorAll('button').forEach(b=>b.disabled=false)}};
