
import fs from 'node:fs'; import vm from 'node:vm'; import assert from 'node:assert/strict';
const root=new URL('..',import.meta.url);
const bundle=fs.readFileSync(new URL('app-bundled.js',root),'utf8').replace(/\nload\(\);\s*$/,'\n');
const elements=new Map();
function makeElement(id){return {id,innerHTML:'',textContent:'',value:'',hidden:false,dataset:{},style:{},classList:{add(){},remove(){},contains(){return false}},addEventListener(){},removeEventListener(){},querySelector(){return null},querySelectorAll(){return []},setAttribute(){},getAttribute(){return ''},focus(){},click(){}}}
const documentStub={getElementById(id){if(!elements.has(id))elements.set(id,makeElement(id));return elements.get(id)},querySelectorAll(){return []},querySelector(){return null},createElement(tag){return makeElement(tag)},addEventListener(){}};
const ctx={window:{addEventListener(){}},btoa(s){return Buffer.from(s,'binary').toString('base64')},atob(s){return Buffer.from(s,'base64').toString('binary')},unescape,encodeURIComponent,document:documentStub,localStorage:{getItem(){return null},setItem(){},removeItem(){}},console,Blob:function(){},URL:{createObjectURL(){return ''},revokeObjectURL(){}},setInterval,clearInterval,setTimeout,clearTimeout,performance:{now:()=>Date.now()},confirm:()=>true,FileReader:function(){},DOMParser:function(){},XMLSerializer:function(){},TextEncoder,TextDecoder};
vm.createContext(ctx); vm.runInContext(bundle,ctx,{timeout:120000}); ctx.MCA_DATA=ctx.window.MCA_DATA;
const result=vm.runInContext(`(()=>{
 Object.assign(state,{meta:MCA_DATA.meta,elements:MCA_DATA.elements,presentation:MCA_DATA.presentation,calculations:MCA_DATA.calculations,definitions:MCA_DATA.definitions,rules:MCA_DATA['business-rules'],elrs:MCA_DATA.elrs,active:'filing',section:0,values:{},prior:{},contexts:[],units:[],errors:[],warnings:[],dimTables:{},profile:{cin:'',companyName:'',fyStart:'2025-04-01',fyEnd:'2026-03-31',currency:'Indian rupee',firstYear:false,financialStatements:'Standalone',inputScale:'Actuals',generalInfoEnabled:true,cashFlowMethod:''}});
 normalizeState();
 const models=v15AllTableModels(); if(models.length!==92)throw new Error('expected 92 catalog structures, got '+models.length);
 const unique=[...new Map(models.map(m=>[m.id,m])).values()];
 let anchors=0,unanchored=[];
 for(const m of unique){
   const host=v22TableHostRole(m), aq=v22TableAbstractQ(m), matches=aq?v22TablesForAbstract(host,aq).filter(x=>x.id===m.id):[];
   if(matches.length)anchors++; else unanchored.push(m.tableQ+' -> '+host+' abstract='+aq);
 }
 if(unanchored.length)throw new Error('unanchored tables: '+unanchored.slice(0,10).join(' | '));
 const roles=[...new Set(unique.map(m=>v22TableHostRole(m)))];
 for(const role of roles){
   const ix=state.elrs.findIndex(e=>e.name===role); if(ix<0)continue;
   state.section=ix;
   const html=filingView();
   if(html.includes('v15-table-card')||html.includes('v22-table-link-card'))throw new Error('separate table card still rendered in '+role);
   const expected=v15TableModels(role).filter(m=>v22TableHostRole(m)===role);
   const missing=expected.filter(m=>!html.includes('data-v22-open="'+esc(v15Pack(role,m.id))+'"'));
   if(missing.length)throw new Error('missing inline table button(s) in '+role+': '+missing.map(m=>m.tableQ).join(', '));
   for(const m of expected){
     const aq=v22TableAbstractQ(m), qpos=aq?html.indexOf(esc(aq)):-1, bpos=html.indexOf('data-v22-open="'+esc(v15Pack(role,m.id))+'"');
     if(aq && (qpos<0 || bpos<qpos))throw new Error('table button is not under its abstract in '+role+': '+m.tableQ);
   }
 }
 const first=unique[0],host=v22TableHostRole(first);
 openDimensionalTable(v15Pack(host,first.id));
 const modalHtml=document.getElementById('modal').innerHTML;
 if(!modalHtml.includes('v22-popup-table'))throw new Error('popup table engine not rendered');
 if(modalHtml.includes('dimensional table engine is not rendered'))throw new Error('legacy not-rendered message');
 return {catalog:models.length,unique:unique.length,anchors,roles:roles.length,popup:true};
})()`,ctx);
console.log(JSON.stringify(result));
