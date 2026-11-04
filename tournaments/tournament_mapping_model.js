/* Browser-only tournament mapping demo: immediate writes, soft deletion and observed sources. */
(function(root){
'use strict';
const KEY='multifeed:tournament-mapping-lifecycle:v1';
const BACKUP_KEY=KEY+':before-soft-delete';
const tournaments=[{"id": "T-001", "name": "Premier League", "sport": "Soccer", "category": "England", "primaryFeed": "EXE", "deleted": false}, {"id": "T-002", "name": "Championship", "sport": "Soccer", "category": "England", "primaryFeed": "SR", "deleted": false}, {"id": "T-003", "name": "League One", "sport": "Soccer", "category": "England", "primaryFeed": "SR", "deleted": false}, {"id": "T-004", "name": "League Two", "sport": "Soccer", "category": "England", "primaryFeed": "EXE", "deleted": false}, {"id": "T-005", "name": "LaLiga", "sport": "Soccer", "category": "Spain", "primaryFeed": "SR", "deleted": false}, {"id": "T-006", "name": "LaLiga 2", "sport": "Soccer", "category": "Spain", "primaryFeed": "EXE", "deleted": false}, {"id": "T-007", "name": "Primera Federacion", "sport": "Soccer", "category": "Spain", "primaryFeed": "BG", "deleted": false}, {"id": "T-008", "name": "Bundesliga", "sport": "Soccer", "category": "Germany", "primaryFeed": "SR", "deleted": false}, {"id": "T-009", "name": "Serie A", "sport": "Soccer", "category": "Italy", "primaryFeed": "BG", "deleted": false}, {"id": "T-010", "name": "Ligue 1", "sport": "Soccer", "category": "France", "primaryFeed": "EXE", "deleted": false}, {"id": "T-011", "name": "SuperLiga", "sport": "Soccer", "category": "Serbia", "primaryFeed": "EXE", "deleted": false}, {"id": "T-012", "name": "BBL", "sport": "Basketball", "category": "Germany", "primaryFeed": "SR", "deleted": false}, {"id": "T-013", "name": "Roland Garros", "sport": "Tennis", "category": "France", "primaryFeed": "BG", "deleted": false}];
// Stable demo category identities; names here only backfill older fixtures.
const categoryIds={ExeFeed:{England:'1126',Spain:'1127',Germany:'1128',France:'1130',Italy:'1131',Serbia:'1132'},SportRadar:{England:'sr:category:1',Spain:'sr:category:32',Germany:'sr:category:30',Italy:'sr:category:31',France:'sr:category:7',Serbia:'sr:category:152',International:'sr:category:39'},SportGenius:{England:'sg-cat-eng',Spain:'sg-cat-es',Germany:'sg-cat-de',Italy:'sg-cat-it',France:'sg-cat-fr',Serbia:'sg-cat-rs'}};
function mappingPrerequisite(source,{targetId}={}){
 const categorySourceId=source.providerCategoryId||categoryIds[source.provider]?.[source.category];
 const categoryUrl=categorySourceId?'../categories/map_category.html?'+new URLSearchParams({provider:source.provider,provId:categorySourceId,returnProvider:source.provider,returnTournamentId:source.provId,...(targetId?{returnTournamentTarget:targetId}:{})}):'../categories/category.html?view=provider';
 const result={mapped:false,categorySourceId,categoryName:source.category||'Unknown category',categoryUrl};
 try{
  if(!root.CategoryMappingDemo)throw Error('Category mappings are unavailable. Reload and try again.');
  const categoryApi=root.CategoryMappingDemo,raw=localStorage.getItem(categoryApi.KEY);
  if(raw){const saved=JSON.parse(raw);if(![1,2].includes(saved.schema)||!Array.isArray(saved.sources))throw Error('Category mappings are unavailable. Reload and try again.');}
  const model=categoryApi.load(),categorySource=model.state.sources.find(row=>row.provider===source.provider&&row.provId===categorySourceId),mapping=categorySource&&model.current(categorySource);
  if(mapping){const category=model.state.categories.find(row=>row.id===mapping.target&&!row.deleted);if(category)return {...result,mapped:true,target:category.id,targetName:category.name};}
  return {...result,reason:'Map the provider category before mapping this tournament.'};
 }catch{return {...result,reason:'Category mappings are unavailable. Reload and try again.'};}
}
const copy=value=>JSON.parse(JSON.stringify(value));
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'demo-'+Date.now()+'-'+Math.random().toString(16).slice(2);
const providers=['ExeFeed','SportRadar','SportGenius'];
function seed(){
 const rows=[{"provider": "ExeFeed", "sport": "Soccer", "category": "England", "provId": "1019001", "provName": "Premier League", "internalId": "T-001", "internalName": "Premier League", "primaryFeed": "EXE", "status": "Mapped"}, {"provider": "ExeFeed", "sport": "Soccer", "category": "England", "provId": "1019002", "provName": "Championship", "internalId": "T-002", "internalName": "Championship", "primaryFeed": "SR", "status": "Mapped"}, {"provider": "ExeFeed", "sport": "Soccer", "category": "England", "provId": "1019032", "provName": "EFL Cup", "internalId": "-", "internalName": "-", "primaryFeed": "-", "status": "Unmapped"}, {"provider": "ExeFeed", "sport": "Soccer", "category": "Spain", "provId": "1019003", "provName": "LaLiga", "internalId": "T-005", "internalName": "LaLiga", "primaryFeed": "SR", "status": "Mapped"}, {"provider": "ExeFeed", "sport": "Soccer", "category": "Spain", "provId": "1019004", "provName": "Copa del Rey", "internalId": "-", "internalName": "-", "primaryFeed": "-", "status": "Unmapped"}, {"provider": "SportRadar", "sport": "Soccer", "category": "England", "provId": "sr:tournament:17", "provName": "Premier League", "internalId": "T-001", "internalName": "Premier League", "primaryFeed": "EXE", "status": "Mapped"}, {"provider": "SportRadar", "sport": "Soccer", "category": "England", "provId": "sr:tournament:24", "provName": "League One", "internalId": "T-003", "internalName": "League One", "primaryFeed": "SR", "status": "Mapped"}, {"provider": "SportRadar", "sport": "Soccer", "category": "Spain", "provId": "sr:tournament:8", "provName": "LaLiga", "internalId": "T-005", "internalName": "LaLiga", "primaryFeed": "SR", "status": "Mapped"}, {"provider": "SportRadar", "sport": "Basketball", "category": "Germany", "provId": "sr:tournament:1192", "provName": "BBL", "internalId": "T-012", "internalName": "BBL", "primaryFeed": "SR", "status": "Mapped"}, {"provider": "SportRadar", "sport": "Tennis", "category": "France", "provId": "sr:tournament:2480", "provName": "Roland Garros", "internalId": "T-013", "internalName": "Roland Garros", "primaryFeed": "BG", "status": "Mapped"}, {"provider": "SportGenius", "sport": "Soccer", "category": "Germany", "provId": "sg-trn-bundesliga", "provName": "Bundesliga", "internalId": "T-008", "internalName": "Bundesliga", "primaryFeed": "SR", "status": "Mapped"}, {"provider": "SportGenius", "sport": "Soccer", "category": "Italy", "provId": "sg-trn-serie-a", "provName": "Serie A", "internalId": "T-009", "internalName": "Serie A", "primaryFeed": "BG", "status": "Mapped"}, {"provider": "SportGenius", "sport": "Soccer", "category": "Serbia", "provId": "sg-trn-cup", "provName": "Serbian Cup", "internalId": "-", "internalName": "-", "primaryFeed": "-", "status": "Unmapped"}, {"provider": "SportGenius", "provId": "sg-trn-epl", "provName": "English Premier League", "sport": "Soccer", "category": "England", "internalId": "T-001"}, {"provider": "SportRadar", "provId": "sr:tournament:18", "provName": "Championship", "sport": "Soccer", "category": "England", "internalId": "T-002"}, {"provider": "SportGenius", "provId": "sg-trn-championship", "provName": "England Championship", "sport": "Soccer", "category": "England", "internalId": "T-002"}, {"provider": "ExeFeed", "provId": "1019006", "provName": "League One", "sport": "Soccer", "category": "England", "internalId": "T-003"}, {"provider": "SportGenius", "provId": "sg-trn-league-one", "provName": "England League One", "sport": "Soccer", "category": "England", "internalId": "T-003"}, {"provider": "ExeFeed", "provId": "1019007", "provName": "League Two", "sport": "Soccer", "category": "England", "internalId": "T-004"}, {"provider": "SportRadar", "provId": "sr:tournament:25", "provName": "League Two", "sport": "Soccer", "category": "England", "internalId": "T-004"}, {"provider": "SportGenius", "provId": "sg-trn-league-two", "provName": "England League Two", "sport": "Soccer", "category": "England", "internalId": "T-004"}, {"provider": "SportGenius", "provId": "sg-trn-laliga", "provName": "Spanish LaLiga", "sport": "Soccer", "category": "Spain", "internalId": "T-005"}, {"provider": "ExeFeed", "provId": "1019005", "provName": "LaLiga 2", "sport": "Soccer", "category": "Spain", "internalId": "T-006"}, {"provider": "SportRadar", "provId": "sr:tournament:54", "provName": "LaLiga 2", "sport": "Soccer", "category": "Spain", "internalId": "T-006"}, {"provider": "SportGenius", "provId": "sg-trn-laliga-2", "provName": "Spain Segunda Division", "sport": "Soccer", "category": "Spain", "internalId": "T-006"}, {"provider": "ExeFeed", "provId": "1019014", "provName": "Primera Federacion", "sport": "Soccer", "category": "Spain", "internalId": "T-007"}, {"provider": "SportRadar", "provId": "sr:tournament:30617", "provName": "Primera Federacion", "sport": "Soccer", "category": "Spain", "internalId": "T-007"}, {"provider": "SportGenius", "provId": "sg-trn-primera-federacion", "provName": "Spain Primera Federacion", "sport": "Soccer", "category": "Spain", "internalId": "T-007"}, {"provider": "ExeFeed", "provId": "1019008", "provName": "Bundesliga", "sport": "Soccer", "category": "Germany", "internalId": "T-008"}, {"provider": "SportRadar", "provId": "sr:tournament:35", "provName": "Bundesliga", "sport": "Soccer", "category": "Germany", "internalId": "T-008"}, {"provider": "ExeFeed", "provId": "1019009", "provName": "Serie A", "sport": "Soccer", "category": "Italy", "internalId": "T-009"}, {"provider": "SportRadar", "provId": "sr:tournament:23", "provName": "Serie A", "sport": "Soccer", "category": "Italy", "internalId": "T-009"}, {"provider": "ExeFeed", "provId": "1019010", "provName": "Ligue 1", "sport": "Soccer", "category": "France", "internalId": "T-010"}, {"provider": "SportRadar", "provId": "sr:tournament:34", "provName": "Ligue 1", "sport": "Soccer", "category": "France", "internalId": "T-010"}, {"provider": "SportGenius", "provId": "sg-trn-ligue-1", "provName": "France Ligue 1", "sport": "Soccer", "category": "France", "internalId": "T-010"}, {"provider": "ExeFeed", "provId": "1019011", "provName": "SuperLiga", "sport": "Soccer", "category": "Serbia", "internalId": "T-011"}, {"provider": "SportRadar", "provId": "sr:tournament:210", "provName": "SuperLiga", "sport": "Soccer", "category": "Serbia", "internalId": "T-011"}, {"provider": "SportGenius", "provId": "sg-trn-superliga", "provName": "Serbia SuperLiga", "sport": "Soccer", "category": "Serbia", "internalId": "T-011"}, {"provider": "ExeFeed", "provId": "1019012", "provName": "BBL", "sport": "Basketball", "category": "Germany", "internalId": "T-012"}, {"provider": "SportGenius", "provId": "sg-trn-bbl", "provName": "Basketball Bundesliga", "sport": "Basketball", "category": "Germany", "internalId": "T-012"}, {"provider": "ExeFeed", "provId": "1019013", "provName": "Roland Garros", "sport": "Tennis", "category": "France", "internalId": "T-013"}, {"provider": "SportGenius", "provId": "sg-trn-roland-garros", "provName": "French Open", "sport": "Tennis", "category": "France", "internalId": "T-013"}, {"provider": "ExeFeed", "provId": "1019017", "provName": "England Premier League", "sport": "Soccer", "category": "England", "internalId": "T-001"}];
 const sources=rows.map((row,index)=>{const target=row.internalId==='-'?null:row.internalId;return {provider:row.provider,provId:row.provId,provName:row.provName,sport:row.sport,category:row.category,firstSeenAt:'2026-10-01T09:00:00.000Z',lastSeenAt:'2026-10-01T09:00:00.000Z',revision:target?1:0,mapping:target?{id:'tournament-map-'+index,target,deleted:false,createdAt:'2026-10-01T09:00:00.000Z',updatedAt:'2026-10-01T09:00:00.000Z',deletedAt:null,operator:'Demo operator'}:null,audit:target?[{action:'Created',mappingId:'tournament-map-'+index,oldTarget:null,target,at:'2026-10-01T09:00:00.000Z',operator:'Demo operator'}]:[]};});
 const correction=sources.find(source=>source.provider==='SportRadar'&&source.provId==='sr:tournament:8');
 correction.mapping.target='T-006';correction.mapping.createdAt='2026-09-01T09:00:00.000Z';correction.audit[0].at='2026-09-01T09:00:00.000Z';correction.audit.push({action:'Updated',mappingId:correction.mapping.id,oldTarget:'T-005',target:'T-006',at:correction.mapping.updatedAt,operator:'Demo operator'});correction.revision=2;
 return {schema:2,tournaments:copy(tournaments),nextCode:14,sources};
}
function migrate(old){
 if(old.schema===2)return copy(old);
 return {schema:2,tournaments:copy(old.tournaments||tournaments),nextCode:old.nextCode||14,sources:old.sources.map(source=>{
  const rows=source.mappings||[],active=rows.find(row=>row.phase==='Active');
  const previous=rows.filter(row=>row.phase==='Deprecated').sort((a,b)=>b.version-a.version)[0];
  const chosen=active||previous;
  return {provider:source.provider,provId:source.provId,provName:source.provName,sport:source.sport,category:source.category,firstSeenAt:null,lastSeenAt:null,revision:chosen?1:0,
   mapping:chosen?{id:chosen.id,target:chosen.target,deleted:!active,createdAt:chosen.validFrom,updatedAt:chosen.validTo||chosen.validFrom,deletedAt:active?null:chosen.validTo,operator:chosen.operator||'Demo operator'}:null,
   audit:rows.filter(row=>row.phase!=='Draft').flatMap(row=>[{action:'Created',mappingId:row.id,oldTarget:null,target:row.target,at:row.validFrom,operator:row.operator||'Demo operator'},...(row.phase==='Deprecated'?[{action:'Deleted',mappingId:row.id,oldTarget:row.target,target:null,at:row.validTo,operator:row.operator||'Demo operator'}]:[])])};
 })};
}
class Model{
 constructor(state){
  this.state=state?migrate(state):seed();
  for(const source of this.state.sources)if(!source.providerCategoryId)source.providerCategoryId=categoryIds[source.provider]?.[source.category]||null;
  if(!this.state.sources.some(row=>row.provider==='SportRadar'&&row.provId==='sr:tournament:demo-fa-cup'))this.state.sources.push({provider:'SportRadar',provId:'sr:tournament:demo-fa-cup',provName:'FA Cup',sport:'Soccer',category:'England',providerCategoryId:'sr:category:1',firstSeenAt:'2026-10-20T10:00:00.000Z',lastSeenAt:'2026-10-20T10:00:00.000Z',revision:0,mapping:null,audit:[]});
  if(!this.state.sources.some(row=>row.provider==='SportRadar'&&row.provId==='sr:tournament:7'))this.state.sources.push({provider:'SportRadar',provId:'sr:tournament:7',provName:'UEFA Champions League',sport:'Soccer',category:'International',providerCategoryId:'sr:category:39',firstSeenAt:'2026-10-20T09:00:00.000Z',lastSeenAt:'2026-10-20T09:00:00.000Z',revision:0,mapping:null,audit:[]});
 }
 source(provider,id){const source=this.state.sources.find(s=>s.provider===provider&&s.provId===id);if(!source)throw Error('Provider tournament not found.');return source;}
 current(source){return source.mapping&&!source.mapping.deleted?source.mapping:null;}
 target(id){const tournament=this.state.tournaments.find(s=>s.id===String(id));if(!tournament)throw Error('Select a valid tournament.');if(tournament.deleted)throw Error('This tournament has been deleted. Select another tournament.');return tournament;}
 saveTournament(name,id=null,{sport,category,primaryFeed}={}){
  const clean=String(name).trim();if(!clean)throw Error('Enter a tournament name.');
  if(!sport||!category||!['EXE','SR','BG'].includes(primaryFeed))throw Error('Select a sport, category and leading feed provider.');
  if(this.state.tournaments.some(t=>!t.deleted&&t.id!==id&&t.sport===sport&&t.category===category&&t.name.trim().toLowerCase()===clean.toLowerCase()))throw Error('A tournament with this name already exists in the selected sport and category.');
  if(id){const tournament=this.target(id);Object.assign(tournament,{name:clean,sport,category,primaryFeed});return tournament;}
  const tournament={id:'T-'+String(this.state.nextCode++).padStart(3,'0'),name:clean,sport,category,primaryFeed,deleted:false};this.state.tournaments.push(tournament);return tournament;
 }
 createFromProvider(provider,id,{name,primaryFeed,expectedRevision,expectedCategoryId}={}){
  const next=new Model(this.state),source=next.source(provider,id);
  if(expectedRevision!==undefined&&source.revision!==expectedRevision)throw Error('This provider tournament changed. Close the window and try again.');
  if(next.current(source))throw Error('This provider tournament is already mapped. Use Manage mapping.');
  const category=mappingPrerequisite(source);
  if(!category.mapped)throw Error(category.reason);
  if(expectedCategoryId!==undefined&&category.target!==expectedCategoryId)throw Error('The category mapping changed. Close the window and review it again.');
  const clean=String(name||'').normalize('NFKC').trim().replace(/\s+/g,' ');
  if(!clean||clean.length>120)throw Error('Enter a tournament name of 1–120 characters.');
  if(!source.sport)throw Error('The provider tournament has no sport.');
  const tournament=next.saveTournament(clean,null,{sport:source.sport,category:category.targetName,primaryFeed});
  tournament.categoryId=category.target;
  tournament.createdFrom={provider,provId:id};
  next.apply(provider,id,'create',{target:tournament.id,expectedRevision});
  this.state=next.state;
  return this.target(tournament.id);
 }
 deleteTournament(id){
  const tournament=this.target(id);
  if(this.state.sources.some(s=>this.current(s)?.target===String(id)))throw Error('Tournament is in use. Delete or update its mappings before deleting it.');
  tournament.deleted=true;
 }

 apply(provider,id,action,{mappingId,target,expectedRevision,at=new Date().toISOString(),operator='Demo operator'}={}){
  const next=new Model(this.state),source=next.source(provider,id),mapping=next.current(source);
  if(expectedRevision!==undefined&&source.revision!==expectedRevision)throw Error('This mapping changed while the form was open. Close it and try again.');
  if(!Number.isFinite(Date.parse(at)))throw Error('Invalid change time.');
  if(action==='create'||action==='edit'){const category=mappingPrerequisite(source);if(!category.mapped)throw Error(category.reason);const destination=next.target(target);if(destination.sport!==source.sport||(destination.categoryId?destination.categoryId!==category.target:destination.category!==category.targetName))throw Error('Select a tournament in the same sport and mapped category.');}
  if(action==='create'){
   next.target(target);if(mapping)throw Error('A mapping already exists. Use Edit mapping.');
   const previous=source.mapping;
   source.mapping={id:previous?.id||uid(),target:String(target),deleted:false,createdAt:previous?.createdAt||at,updatedAt:at,deletedAt:null,operator};
   source.audit.push({action:'Created',mappingId:source.mapping.id,oldTarget:null,target:String(target),at,operator});
  }else if(action==='edit'||action==='delete'){
   if(!mapping||mapping.id!==mappingId)throw Error('Mapping no longer exists. Close the form and try again.');
   const oldTarget=mapping.target;
   if(action==='edit'){
    next.target(target);if(oldTarget===String(target))throw Error('Select a different tournament.');
    mapping.target=String(target);
   }else{mapping.deleted=true;mapping.deletedAt=at;}
   mapping.updatedAt=at;mapping.operator=operator;
   source.audit.push({action:action==='edit'?'Updated':'Deleted',mappingId:mapping.id,oldTarget,target:action==='delete'?null:String(target),at,operator});
  }else throw Error('Unknown mapping action.');
  source.revision+=1;this.state=next.state;return this.source(provider,id);
 }
 observeUnmapped({provider,provId,provName='',at=new Date().toISOString()}){
  if(!providers.includes(provider)||!String(provId||'').trim()||!Number.isFinite(Date.parse(at)))throw Error('Invalid provider tournament notification.');
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
function load({strict=false}={}){
 let saved;try{saved=JSON.parse(localStorage.getItem(KEY));}catch{if(strict)throw Error('Tournament data could not be read. No changes were saved.');}
 if(strict&&saved&&(![1,2].includes(saved.schema)||!Array.isArray(saved.sources)||!Array.isArray(saved.tournaments)))throw Error('Tournament data could not be read. No changes were saved.');
 if(!saved||![1,2].includes(saved.schema)||!Array.isArray(saved.sources))return new Model();
 const model=new Model(saved);
 if(saved.schema===1){try{if(!localStorage.getItem(BACKUP_KEY))localStorage.setItem(BACKUP_KEY,JSON.stringify(saved));localStorage.setItem(KEY,JSON.stringify(model.state));}catch{}}
 return model;
}
function save(model){localStorage.setItem(KEY,JSON.stringify(model.state));}
function providerRows(){const model=load();return model.state.sources.map(source=>{const mapping=model.current(source),tournament=mapping?model.state.tournaments.find(s=>s.id===mapping.target&&!s.deleted):null;return {...source,categoryMapping:mappingPrerequisite(source),internalId:mapping?.target||'-',internalName:tournament?.name||'-',primaryFeed:tournament?.primaryFeed||'-',status:mapping?'Mapped':'Unmapped'};});}
function unmappedRows(){return providerRows().filter(source=>source.status==='Unmapped');}
const api={Model,seed,migrate,load,save,providerRows,unmappedRows,mappingPrerequisite,KEY,BACKUP_KEY,get tournaments(){return load().state.tournaments;}};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TournamentMappingDemo=api;
})(typeof window==='undefined'?globalThis:window);
