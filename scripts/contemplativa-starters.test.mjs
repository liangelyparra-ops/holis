import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const code=await readFile(new URL('./contemplativa/starter.js',import.meta.url),'utf8');
const key='portfolio-contemplativa-clave-document-v1';
function run(entries={}){const data=new Map(Object.entries(entries));vm.runInNewContext(code,{localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},matchMedia:()=>({matches:false}),innerWidth:390,innerHeight:844});return data;}
test('fresh Clave starts with a responsive editable composition',()=>{const data=run(),doc=JSON.parse(data.get(key));assert.equal(data.get('portfolio-contemplativa-clave-theme-v1'),'dark');assert.equal(doc.version,3);assert.equal(doc.entities.length,3);assert.ok(doc.camera.zoom<1);assert.ok(doc.entities.every(e=>e.id&&e.stroke&&e.params&&e.color));});
test('existing artwork and intentionally cleared compositions stay intact',()=>{const work=JSON.stringify({entities:[{id:'my-work'}]});assert.equal(run({[key]:work}).get(key),work);const empty=JSON.stringify({entities:[]});assert.equal(run({[key]:empty,[key+'-starter-v1']:'1'}).get(key),empty);assert.equal(run({[key]:'unreadable'}).get(key),'unreadable');});
