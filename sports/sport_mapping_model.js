/* Browser-only sport mapping lifecycle demo. No backend calls. */
(function(root){
'use strict';
const KEY='multifeed:sport-mapping-lifecycle:v1';
// Prototype catalog; IDs beyond Soccer and Basketball are demo values.
const sports=[
 {id:'1',name:'Soccer',abbr:'S'},
 {id:'2',name:'Basketball',abbr:'B'},
 {id:'3',name:'Tennis',abbr:'TEN'},
 {id:'4',name:'Ice Hockey',abbr:'IHO'},
 {id:'5',name:'Baseball',abbr:'BBS'},
 {id:'6',name:'Moto GP',abbr:'MGP'},
 {id:'7',name:'Volleyball',abbr:'VOL'},
 {id:'8',name:'Handball',abbr:'HBL'},
 {id:'9',name:'Cricket',abbr:'CRI'},
 {id:'10',name:'Motorsport',abbr:'MOT'}
];
const copy=x=>JSON.parse(JSON.stringify(x));
function seed(){
 const sources=[['ExeFeed','F','Fudbal'],['ExeFeed','B','Košarka'],['SportRadar','sr:sport:1','Football'],['SportRadar','sr:sport:2','Basketball'],['ExeFeed','T','Tenis'],['ExeFeed','IH','Hokej na ledu'],['ExeFeed','V','Odbojka'],['ExeFeed','H','Rukomet'],['SportGenius','sg-10','Ice Hockey']].map(([provider,provId,provName])=>({provider,provId,provName,mappings:[]}));
 const revision=(id,target,phase,version=null,validFrom=null,validTo=null)=>({id,target,phase,version,validFrom,validTo,operator:'Demo operator'});
 sources[0].mappings=[revision('map-exe-f-0','1','Active',0,'2026-10-01T09:00:00.000Z')];
 sources[2].mappings=[revision('map-sr-f-0','1','Deprecated',0,'2026-10-01T09:00:00.000Z','2026-10-08T09:00:00.000Z'),revision('map-sr-f-1','2','Active',1,'2026-10-08T09:00:00.000Z'),revision('map-sr-f-draft','1','Draft')];
 return {schema:1,sources};
}
class Model {
 constructor(state){this.state=copy(state||seed());}
 source(provider,id){const source=this.state.sources.find(s=>s.provider===provider&&s.provId===id);if(!source)throw Error('Provider sport not found.');return source;}
 current(source){return source.mappings.find(m=>m.phase==='Active')||null;}
 draft(source){return source.mappings.find(m=>m.phase==='Draft')||null;}
 target(id){const sport=sports.find(s=>s.id===String(id));if(!sport)throw Error('Select an enabled sport.');return sport;}
 mapping(source,id){const m=source.mappings.find(m=>m.id===id);if(!m)throw Error('Mapping no longer exists. Refresh the page.');return m;}
 apply(provider,id,action,{mappingId,target,at=new Date().toISOString()}={}){
  // Validate on a copy so rejected operations never partially change stored state.
  const next=new Model(this.state),source=next.source(provider,id),active=next.current(source),draft=next.draft(source);
  if(action==='create'||action==='replace'){
   next.target(target);
   if(draft)throw Error('A draft already exists. Edit or delete it first.');
   if(action==='create'&&active)throw Error('An active mapping exists. Use Create new version.');
   if(action==='replace') {const base=next.mapping(source,mappingId);if(base.phase!=='Active')throw Error('A new version requires the current active mapping.');if(base.target===String(target))throw Error('The selected sport is already active. Choose a different target.');}
   const uid=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'demo-'+Date.now()+'-'+Math.random().toString(16).slice(2);
   source.mappings.push({id:uid,target:String(target),phase:'Draft',version:null,validFrom:null,validTo:null,operator:'Demo operator'});
  }else{
   const m=next.mapping(source,mappingId);
   if(action==='edit'){if(m.phase!=='Draft')throw Error('Only drafts can be edited.');next.target(target);if(active&&active.target===String(target))throw Error('The selected sport is already active.');m.target=String(target);}
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
function providerRows(){const model=load();return model.state.sources.map(s=>{const active=model.current(s),sport=active?sports.find(x=>x.id===active.target):null;return {...s,internalId:active?.target||'-',internalName:sport?.name||'-',internalAbbr:sport?.abbr||'-',status:active?'Mapped':'Unmapped'};});}
const api={Model,seed,sports,load,save,providerRows,KEY};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SportMappingDemo=api;
})(typeof window==='undefined'?globalThis:window);
