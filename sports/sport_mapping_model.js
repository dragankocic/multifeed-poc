/* Browser-only sport mapping demo: immediate writes, soft deletion and observed sources. */
(function(root){
'use strict';
const KEY='multifeed:sport-mapping-lifecycle:v1';
const BACKUP_KEY=KEY+':before-soft-delete';
const sports=[
 {id:'1',name:'Soccer',abbr:'SOC'},
 {id:'2',name:'Basketball',abbr:'BKB'},
 {id:'3',name:'Tennis',abbr:'TEN'},
 {id:'4',name:'Ice Hockey',abbr:'IHO'},
 {id:'5',name:'Baseball',abbr:'BBS'},
 {id:'6',name:'Moto GP',abbr:'MGP'},
 {id:'7',name:'Volleyball',abbr:'VOL'},
 {id:'8',name:'Handball',abbr:'HBL'},
 {id:'9',name:'Cricket',abbr:'CRI'},
 {id:'10',name:'Motorsport',abbr:'MOT'}
];

const copy=value=>JSON.parse(JSON.stringify(value));
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'demo-'+Date.now()+'-'+Math.random().toString(16).slice(2);
const providers=['ExeFeed','SportRadar','SportGenius'];
function seed(){
 const sources=[['ExeFeed','F','Fudbal','1'],['ExeFeed','B','Košarka','2'],['SportRadar','sr:sport:1','Football','1'],['SportRadar','sr:sport:2','Basketball','2'],['ExeFeed','T','Tenis','3'],['ExeFeed','IH','Hokej na ledu','4'],['ExeFeed','V','Odbojka',null],['ExeFeed','H','Rukomet',null],['SportGenius','sg-10','Ice Hockey','4']].map(([provider,provId,provName,target],index)=>({provider,provId,provName,firstSeenAt:'2026-10-01T09:00:00.000Z',lastSeenAt:'2026-10-01T09:00:00.000Z',revision:target?1:0,mapping:target?{id:'sport-map-'+index,target,deleted:false,createdAt:'2026-10-01T09:00:00.000Z',updatedAt:'2026-10-01T09:00:00.000Z',deletedAt:null,operator:'Demo operator'}:null,audit:target?[{action:'Created',mappingId:'sport-map-'+index,oldTarget:null,target,at:'2026-10-01T09:00:00.000Z',operator:'Demo operator'}]:[]}));
 return {schema:2,sources};
}
function migrate(old){
 if(old.schema===2)return copy(old);
 return {schema:2,sources:old.sources.map(source=>{
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
 source(provider,id){const source=this.state.sources.find(s=>s.provider===provider&&s.provId===id);if(!source)throw Error('Provider sport not found.');return source;}
 current(source){return source.mapping&&!source.mapping.deleted?source.mapping:null;}
 target(id){const sport=sports.find(s=>s.id===String(id));if(!sport)throw Error('Select a valid sport.');return sport;}
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
    next.target(target);if(oldTarget===String(target))throw Error('Select a different sport.');
    mapping.target=String(target);
   }else{mapping.deleted=true;mapping.deletedAt=at;}
   mapping.updatedAt=at;mapping.operator=operator;
   source.audit.push({action:action==='edit'?'Updated':'Deleted',mappingId:mapping.id,oldTarget,target:action==='delete'?null:String(target),at,operator});
  }else throw Error('Unknown mapping action.');
  source.revision+=1;this.state=next.state;return this.source(provider,id);
 }
 observeUnmapped({provider,provId,provName='',at=new Date().toISOString()}){
  if(!providers.includes(provider)||!String(provId||'').trim()||!Number.isFinite(Date.parse(at)))throw Error('Invalid provider sport notification.');
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
 // Correct only the untouched old demo seed; preserve operator changes and deletions.
 const source=model.state.sources.find(row=>row.provider==='SportRadar'&&row.provId==='sr:sport:1');
 const initial=source?.audit?.[0],mapping=source&&model.current(source);
 if(source?.revision===1&&mapping?.id==='sport-map-2'&&mapping.target==='2'&&source.audit.length===1&&initial.action==='Created'&&initial.target==='2'&&initial.at==='2026-10-01T09:00:00.000Z'){
  model.apply(source.provider,source.provId,'edit',{mappingId:mapping.id,target:'1',expectedRevision:1,operator:'Demo data correction'});
  localStorage.setItem(KEY,JSON.stringify(model.state));
 }
 // Fill only untouched demo sources; never replace a user's mapping or deletion.
 let addedDemoMappings=false;
 for(const [provider,id,target] of [['ExeFeed','B','2'],['SportRadar','sr:sport:2','2'],['ExeFeed','T','3'],['ExeFeed','IH','4'],['SportGenius','sg-10','4']]){
  const row=model.state.sources.find(s=>s.provider===provider&&s.provId===id);
  if(row?.revision===0&&row.mapping===null&&row.audit?.length===0&&row.firstSeenAt==='2026-10-01T09:00:00.000Z'){
   model.apply(provider,id,'create',{target,expectedRevision:0,operator:'Demo data setup'});addedDemoMappings=true;
  }
 }
 if(addedDemoMappings)localStorage.setItem(KEY,JSON.stringify(model.state));
 if(saved.schema===1){try{if(!localStorage.getItem(BACKUP_KEY))localStorage.setItem(BACKUP_KEY,JSON.stringify(saved));localStorage.setItem(KEY,JSON.stringify(model.state));}catch{}}
 return model;
}
function save(model){localStorage.setItem(KEY,JSON.stringify(model.state));}
function providerRows(){const model=load();return model.state.sources.map(source=>{const mapping=model.current(source),sport=mapping?sports.find(s=>s.id===mapping.target):null;return {...source,internalId:mapping?.target||'-',internalName:sport?.name||'-',internalAbbr:sport?.abbr||'-',status:mapping?'Mapped':'Unmapped'};});}
function unmappedRows(){return providerRows().filter(source=>source.status==='Unmapped');}
const api={Model,seed,migrate,sports,load,save,providerRows,unmappedRows,KEY,BACKUP_KEY};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SportMappingDemo=api;
})(typeof window==='undefined'?globalThis:window);
