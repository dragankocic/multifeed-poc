/* Browser-only category mapping demo: immediate writes, soft deletion and observed sources. */
(function(root){
'use strict';
const KEY='multifeed:category-mapping-lifecycle:v1';
const BACKUP_KEY=KEY+':before-soft-delete';
const categories=[{"id": "1", "name": "England", "deleted": false}, {"id": "2", "name": "Spain", "deleted": false}, {"id": "3", "name": "Germany", "deleted": false}, {"id": "4", "name": "Italy", "deleted": false}, {"id": "5", "name": "France", "deleted": false}, {"id": "6", "name": "Serbia", "deleted": false}, {"id": "7", "name": "United States", "deleted": false}, {"id": "8", "name": "International", "deleted": false}, {"id": "9", "name": "Europe", "deleted": false}];
const copy=value=>JSON.parse(JSON.stringify(value));
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'demo-'+Date.now()+'-'+Math.random().toString(16).slice(2);
const providers=['ExeFeed','SportRadar','SportGenius'];
function seed(){
 const rows=[["ExeFeed", "1126", "England", "1"], ["ExeFeed", "1127", "Spain", "2"], ["ExeFeed", "1128", "Germany", "3"], ["ExeFeed", "1129", "United States", "7"], ["ExeFeed", "1130", "France", "5"], ["ExeFeed", "1131", "Italy", "4"], ["ExeFeed", "1132", "Serbia", "6"], ["ExeFeed", "eng-youth", "England Youth", "1"], ["SportRadar", "sr:category:1", "England", "1"], ["SportRadar", "sr:category:32", "Spain", "3"], ["SportRadar", "sr:category:30", "Germany", "3"], ["SportRadar", "sr:category:31", "Italy", "4"], ["SportRadar", "sr:category:7", "France", "5"], ["SportRadar", "sr:category:152", "Serbia", "6"], ["SportRadar", "sr:category:39", "International", null], ["SportRadar", "sr:category:15", "Europe", null], ["SportGenius", "sg-cat-uk", "UK", null], ["SportGenius", "sg-cat-eng", "English Competitions", "1"], ["SportGenius", "sg-cat-es", "Spanish Competitions", "2"], ["SportGenius", "sg-cat-de", "Deutschland", "3"], ["SportGenius", "sg-cat-it", "Italy", "4"], ["SportGenius", "sg-cat-fr", "French Competitions", "5"], ["SportGenius", "sg-cat-rs", "Serbia", "6"]];
 const sources=rows.map(([provider,provId,provName,target],index)=>({provider,provId,provName,firstSeenAt:'2026-10-01T09:00:00.000Z',lastSeenAt:'2026-10-01T09:00:00.000Z',revision:target?1:0,mapping:target?{id:'category-map-'+index,target,deleted:false,createdAt:'2026-10-01T09:00:00.000Z',updatedAt:'2026-10-01T09:00:00.000Z',deletedAt:null,operator:'Demo operator'}:null,audit:target?[{action:'Created',mappingId:'category-map-'+index,oldTarget:null,target,at:'2026-10-01T09:00:00.000Z',operator:'Demo operator'}]:[]}));
 return {schema:2,categories:copy(categories),nextCode:10,sources};
}
function migrate(old){
 if(old.schema===2)return copy(old);
 return {schema:2,categories:copy(old.categories||categories),nextCode:old.nextCode||10,sources:old.sources.map(source=>{
  const rows=source.mappings||[],active=rows.find(row=>row.phase==='Active');
  const previous=rows.filter(row=>row.phase==='Deprecated').sort((a,b)=>b.version-a.version)[0];
  const chosen=active||previous;
  return {provider:source.provider,provId:source.provId,provName:source.provName,firstSeenAt:null,lastSeenAt:null,revision:chosen?1:0,
   mapping:chosen?{id:chosen.id,target:chosen.target,deleted:!active,createdAt:chosen.validFrom,updatedAt:chosen.validTo||chosen.validFrom,deletedAt:active?null:chosen.validTo,operator:chosen.operator||'Demo operator'}:null,
   audit:rows.filter(row=>row.phase!=='Draft').flatMap(row=>[{action:'Created',mappingId:row.id,oldTarget:null,target:row.target,at:row.validFrom,operator:row.operator||'Demo operator'},...(row.phase==='Deprecated'?[{action:'Deleted',mappingId:row.id,oldTarget:row.target,target:null,at:row.validTo,operator:row.operator||'Demo operator'}]:[])])};
 })};
}
class Model{
 constructor(state){this.state=state?migrate(state):seed();}
 source(provider,id){const source=this.state.sources.find(s=>s.provider===provider&&s.provId===id);if(!source)throw Error('Provider category not found.');return source;}
 current(source){return source.mapping&&!source.mapping.deleted?source.mapping:null;}
 target(id){const category=this.state.categories.find(s=>s.id===String(id));if(!category)throw Error('Select a valid category.');if(category.deleted)throw Error('This category has been deleted. Select another category.');return category;}
 saveCategory(name,id=null){
  const clean=String(name).trim();if(!clean)throw Error('Enter a category name.');
  if(this.state.categories.some(c=>!c.deleted&&c.id!==id&&c.name.trim().toLowerCase()===clean.toLowerCase()))throw Error('A category with this name already exists.');
  if(id){const category=this.target(id);category.name=clean;return category;}
  const category={id:String(this.state.nextCode++),name:clean,deleted:false};this.state.categories.push(category);return category;
 }
 deleteCategory(id){
  const category=this.target(id);
  if(this.state.sources.some(s=>this.current(s)?.target===String(id)))throw Error('Category is in use. Delete or update its mappings before deleting it.');
  category.deleted=true;
 }

 apply(provider,id,action,{mappingId,target,expectedRevision,at=new Date().toISOString(),operator='Demo operator'}={}){
  const next=new Model(this.state),source=next.source(provider,id),mapping=next.current(source);
  if(expectedRevision!==undefined&&source.revision!==expectedRevision)throw Error('This mapping changed while the form was open. Close it and try again.');
  if(!Number.isFinite(Date.parse(at)))throw Error('Invalid change time.');
  if(action==='create'){
   next.target(target);if(mapping)throw Error('A mapping already exists. Use Edit mapping.');
   const previous=source.mapping;
   source.mapping={id:previous?.id||uid(),target:String(target),deleted:false,createdAt:previous?.createdAt||at,updatedAt:at,deletedAt:null,operator};
   source.audit.push({action:'Created',mappingId:source.mapping.id,oldTarget:null,target:String(target),at,operator});
  }else if(action==='edit'||action==='delete'){
   if(!mapping||mapping.id!==mappingId)throw Error('Mapping no longer exists. Close the form and try again.');
   const oldTarget=mapping.target;
   if(action==='edit'){
    next.target(target);if(oldTarget===String(target))throw Error('Select a different category.');
    mapping.target=String(target);
   }else{mapping.deleted=true;mapping.deletedAt=at;}
   mapping.updatedAt=at;mapping.operator=operator;
   source.audit.push({action:action==='edit'?'Updated':'Deleted',mappingId:mapping.id,oldTarget,target:action==='delete'?null:String(target),at,operator});
  }else throw Error('Unknown mapping action.');
  source.revision+=1;this.state=next.state;return this.source(provider,id);
 }
 observeUnmapped({provider,provId,provName='',at=new Date().toISOString()}){
  if(!providers.includes(provider)||!String(provId||'').trim()||!Number.isFinite(Date.parse(at)))throw Error('Invalid provider category notification.');
  let source=this.state.sources.find(s=>s.provider===provider&&s.provId===String(provId));
  if(!source){source={provider,provId:String(provId),provName:provName||String(provId),firstSeenAt:at,lastSeenAt:at,revision:0,mapping:null,audit:[]};this.state.sources.push(source);}
  else{
   if(!source.firstSeenAt||Date.parse(at)<Date.parse(source.firstSeenAt))source.firstSeenAt=at;
   if(!source.lastSeenAt||Date.parse(at)>=Date.parse(source.lastSeenAt)){source.lastSeenAt=at;if(provName)source.provName=provName;}
  }
  // A late failure notification registers the observed source; it never removes a current mapping.
  return source;
 }
}
function load(){
 let saved;try{saved=JSON.parse(localStorage.getItem(KEY));}catch{throw Error('Saved mappings could not be read. No changes were saved.');}
 if(!saved)return new Model();
 if(![1,2].includes(saved.schema)||!Array.isArray(saved.sources))throw Error('Saved mappings are invalid. No changes were saved.');
 const model=new Model(saved);
 if(saved.schema===1){try{if(!localStorage.getItem(BACKUP_KEY))localStorage.setItem(BACKUP_KEY,JSON.stringify(saved));localStorage.setItem(KEY,JSON.stringify(model.state));}catch{}}
 return model;
}
function save(model){localStorage.setItem(KEY,JSON.stringify(model.state));}
function providerRows(){const model=load();return model.state.sources.map(source=>{const mapping=model.current(source),category=mapping?model.state.categories.find(s=>s.id===mapping.target&&!s.deleted):null;return {...source,internalId:mapping?.target||'-',internalName:category?.name||'-',status:mapping?'Mapped':'Unmapped'};});}
function unmappedRows(){return providerRows().filter(source=>source.status==='Unmapped');}
const api={Model,seed,migrate,load,save,providerRows,unmappedRows,KEY,BACKUP_KEY,get categories(){return load().state.categories;}};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CategoryMappingDemo=api;
})(typeof window==='undefined'?globalThis:window);
