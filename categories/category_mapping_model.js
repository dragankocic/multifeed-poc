/* Browser-only category mapping lifecycle demo. No backend calls. */
(function(root){
'use strict';
const KEY='multifeed:category-mapping-lifecycle:v1';
const categories=[{"id": "1", "name": "England", "deleted": false}, {"id": "2", "name": "Spain", "deleted": false}, {"id": "3", "name": "Germany", "deleted": false}, {"id": "4", "name": "Italy", "deleted": false}, {"id": "5", "name": "France", "deleted": false}, {"id": "6", "name": "Serbia", "deleted": false}, {"id": "7", "name": "United States", "deleted": false}, {"id": "8", "name": "International", "deleted": false}, {"id": "9", "name": "Europe", "deleted": false}];
const copy=x=>JSON.parse(JSON.stringify(x));
function seed(){
 const rows=[["ExeFeed", "1126", "England", "1"], ["ExeFeed", "1127", "Spain", "2"], ["ExeFeed", "1128", "Germany", "3"], ["ExeFeed", "1129", "United States", "7"], ["ExeFeed", "1130", "France", "5"], ["ExeFeed", "1131", "Italy", "4"], ["ExeFeed", "1132", "Serbia", "6"], ["ExeFeed", "eng-youth", "England Youth", "1"], ["SportRadar", "sr:category:1", "England", "1"], ["SportRadar", "sr:category:32", "Spain", "3"], ["SportRadar", "sr:category:30", "Germany", "3"], ["SportRadar", "sr:category:31", "Italy", "4"], ["SportRadar", "sr:category:7", "France", "5"], ["SportRadar", "sr:category:152", "Serbia", "6"], ["SportRadar", "sr:category:39", "International", null], ["SportRadar", "sr:category:15", "Europe", null], ["SportGenius", "sg-cat-uk", "UK", null], ["SportGenius", "sg-cat-eng", "English Competitions", "1"], ["SportGenius", "sg-cat-es", "Spanish Competitions", "2"], ["SportGenius", "sg-cat-de", "Deutschland", "3"], ["SportGenius", "sg-cat-it", "Italy", "4"], ["SportGenius", "sg-cat-fr", "French Competitions", "5"], ["SportGenius", "sg-cat-rs", "Serbia", "6"]];
 const revision=(id,target,phase,version=null,validFrom=null,validTo=null)=>({id,target,phase,version,validFrom,validTo,operator:'Demo operator'});
 const sources=rows.map(([provider,provId,provName,target],index)=>({provider,provId,provName,mappings:target?[revision('category-map-'+index,target,'Active',0,'2026-10-01T09:00:00.000Z')]:[]}));
 const correction=sources.find(s=>s.provId==='sr:category:32');
 correction.mappings.unshift(revision('category-spain-history','2','Deprecated',0,'2026-09-01T09:00:00.000Z','2026-10-01T09:00:00.000Z'));
 correction.mappings[1].version=1;
 correction.mappings.push(revision('category-spain-draft','2','Draft'));
 return {schema:1,categories:copy(categories),nextCode:10,sources};
}
class Model {
 constructor(state){this.state=copy(state||seed());}
 source(provider,id){const source=this.state.sources.find(s=>s.provider===provider&&s.provId===id);if(!source)throw Error('Provider category not found.');return source;}
 current(source){return source.mappings.find(m=>m.phase==='Active')||null;}
 draft(source){return source.mappings.find(m=>m.phase==='Draft')||null;}
 target(id){const category=this.state.categories.find(s=>s.id===String(id));if(!category)throw Error('Category not found.');if(category.deleted)throw Error('This category has been deleted. Select another category.');return category;}
 mapping(source,id){const m=source.mappings.find(m=>m.id===id);if(!m)throw Error('Mapping no longer exists. Refresh the page.');return m;}
 saveCategory(name,id=null){
  const clean=String(name).trim();if(!clean)throw Error('Enter a category name.');
  if(this.state.categories.some(c=>!c.deleted&&c.id!==id&&c.name.trim().toLowerCase()===clean.toLowerCase()))throw Error('A category with this name already exists.');
  if(id){const category=this.target(id);category.name=clean;return category;}
  const category={id:String(this.state.nextCode++),name:clean,deleted:false};this.state.categories.push(category);return category;
 }
 deleteCategory(id){
  const category=this.target(id);
  if(this.state.sources.some(s=>this.current(s)?.target===String(id)))throw Error('Category is in use. Deactivate or replace its active mappings before deleting it.');
  category.deleted=true;
 }

 apply(provider,id,action,{mappingId,target,at=new Date().toISOString()}={}){
  // Validate on a copy so rejected operations never partially change stored state.
  const next=new Model(this.state),source=next.source(provider,id),active=next.current(source),draft=next.draft(source);
  if(action==='create'||action==='replace'){
   next.target(target);
   if(draft)throw Error('A draft already exists. Edit or delete it first.');
   if(action==='create'&&active)throw Error('An active mapping exists. Use Create new version.');
   if(action==='replace') {const base=next.mapping(source,mappingId);if(base.phase!=='Active')throw Error('A new version requires the current active mapping.');if(base.target===String(target))throw Error('The selected category is already active. Choose a different target.');}
   const uid=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'demo-'+Date.now()+'-'+Math.random().toString(16).slice(2);
   source.mappings.push({id:uid,target:String(target),phase:'Draft',version:null,validFrom:null,validTo:null,operator:'Demo operator'});
  }else{
   const m=next.mapping(source,mappingId);
   if(action==='edit'){if(m.phase!=='Draft')throw Error('Only drafts can be edited.');next.target(target);if(active&&active.target===String(target))throw Error('The selected category is already active.');m.target=String(target);}
   else if(action==='delete'){if(m.phase!=='Draft')throw Error('Only drafts can be deleted.');source.mappings=source.mappings.filter(x=>x.id!==m.id);}
   else if(action==='activate'){
    if(m.phase!=='Draft')throw Error('Only drafts can be activated.');next.target(m.target);if(!Number.isFinite(Date.parse(at)))throw Error('Invalid activation time.');
    if(active&&Date.parse(at)<Date.parse(active.validFrom))throw Error('Activation cannot precede the active mapping start time.');
    const versions=source.mappings.filter(x=>x.version!==null).map(x=>x.version);
    if(active){active.phase='Deprecated';active.validTo=at;}
    m.phase='Active';m.version=versions.length?Math.max(...versions)+1:0;m.validFrom=at;
   }else if(action==='deprecate'){
    if(m.phase!=='Active')throw Error('Only active mappings can be deactivated.');
    if(!Number.isFinite(Date.parse(at))||Date.parse(at)<Date.parse(m.validFrom))throw Error('Deactivation cannot precede activation.');m.phase='Deprecated';m.validTo=at;
   }else throw Error('Unknown action.');
  }
  this.state=next.state;return this.source(provider,id);
 }
}
function load(){try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved?.schema===1&&Array.isArray(saved.sources))return new Model(saved);}catch{}return new Model();}
function save(model){localStorage.setItem(KEY,JSON.stringify(model.state));}
function providerRows(){const model=load();return model.state.sources.map(s=>{const active=model.current(s),category=active?model.state.categories.find(x=>x.id===active.target):null;return {...s,internalId:active?.target||'-',internalName:category?.name||'-',status:active?'Mapped':'Unmapped',hasDraft:!!model.draft(s)};});}
const api={Model,seed,load,save,providerRows,KEY,get categories(){return load().state.categories;}};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CategoryMappingDemo=api;
})(typeof window==='undefined'?globalThis:window);
