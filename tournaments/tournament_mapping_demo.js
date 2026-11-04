document.addEventListener('DOMContentLoaded',()=>{
'use strict';
const api=window.TournamentMappingDemo,$=id=>document.getElementById(id),escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let model=api.load(),selected=null,pending=null;
const params=new URLSearchParams(location.search);
if(!params.has('provider')){location.href='tournament.html?view=provider';return;}
const targetPicker=window.MappingTargetPicker({getEntities:()=>{const category=selected&&api.mappingPrerequisite(selected);return api.tournaments.filter(row=>selected&&category?.mapped&&row.sport===selected.sport&&(row.categoryId?row.categoryId===category.target:row.category===category.targetName));},entityName:'tournament'});
const badge=(text,kind='')=>`<span class="mapping-badge ${kind}">${escape(text)}</span>`;
const date=value=>value?new Date(value).toLocaleString('en-GB',{timeZone:'UTC'})+' UTC':'—';
const target=id=>{const tournament=api.tournaments.find(s=>s.id===id);return tournament?`${tournament.id} · ${tournament.name} · ${tournament.sport} / ${tournament.category}`:'—';};
const button=(text,action,id='')=>`<button type="button" class="btn-action" data-action="${action}" data-mapping-id="${escape(id)}" ${action!=='delete'&&selected&&!api.mappingPrerequisite(selected).mapped?'disabled aria-disabled="true"':''}>${text}</button>`;
function message(text,error=false){$('mappingMessage').textContent=text;$('mappingMessage').className='mapping-message'+(error?' error':'');$('mappingMessage').hidden=false;}
function previousMappings(source){
 const rows=[];let mappedFrom=null,mappedTarget=null;
 for(const entry of source.audit){
  if(entry.action==='Created'){mappedFrom=entry.at;mappedTarget=entry.target;}
  else if(entry.action==='Updated'||entry.action==='Deleted'){
   const oldTarget=entry.oldTarget||mappedTarget;
   if(oldTarget)rows.push({target:oldTarget,from:mappedFrom,to:entry.at,operator:entry.operator});
   mappedFrom=entry.action==='Updated'?entry.at:null;
   mappedTarget=entry.action==='Updated'?entry.target:null;
  }
 }
 return rows.reverse();
}
function render(){
 $('mappingPageTitle').textContent=selected?'Manage mapping':'Mapping not found';
 $('mappingPageSubtitle').textContent=selected?'':'Return to Provider tournaments and select a tournament.';
 $('mappingPageSubtitle').hidden=!!selected;
 $('mappingDetails').hidden=!selected;if(!selected)return;
 const mapping=model.current(selected),tournament=mapping?api.tournaments.find(s=>s.id===mapping.target):null;
 $('createTournamentFromProvider').hidden=Boolean(mapping);
 const category=api.mappingPrerequisite(selected,{targetId:params.get('target')});
 $('tournamentCategoryGate').hidden=category.mapped;
 $('tournamentCategoryGate').innerHTML=category.mapped?'':`<strong>Category mapping required</strong><div>${escape(selected.provider)} · ${escape(category.categoryName)} · ${escape(category.categorySourceId||'Unknown ID')}</div><div>${escape(category.reason)}</div><a href="${escape(category.categoryUrl)}" style="display:inline-block;margin-top:10px;color:#176583;font-weight:600">Map category</a>`;
 $('mappingDetailTitle').textContent=selected.provName;$('mappingDetailSource').textContent=selected.provider+' · '+selected.provId;
 $('mappingCurrent').innerHTML=mapping?`<div class="tournament-map-master"><span class="tournament-map-caption">Tournament</span><strong>${escape(tournament.name)}</strong><div class="tournament-map-meta">${escape(tournament.sport)} · ${escape(tournament.category)}</div><div class="tournament-map-meta">Tournament ID ${escape(tournament.id)}</div><div class="tournament-map-updated">Last changed ${escape(date(mapping.updatedAt))}</div></div><div class="mapping-actions">${button('Edit mapping','edit',mapping.id)}${button('Delete mapping','delete',mapping.id)}</div>`:`<div class="tournament-map-master"><span class="tournament-map-caption">Tournament</span><strong class="tournament-map-unmapped">Select a tournament</strong></div><div class="mapping-actions">${button('Select tournament','create')}${button('Create tournament','createTournament')}</div>`;
 const rows=previousMappings(selected);
 if(mapping)rows.unshift({target:mapping.target,from:mapping.updatedAt,to:null,operator:mapping.operator,current:true});
 $('mappingHistory').innerHTML='<div class="mapping-history-heading"><h3>Mapping history</h3></div>'+(rows.length?`<div class="mapping-table-wrap"><table class="mapping-table"><thead><tr><th>Tournament</th><th>Mapped from</th><th>Mapped until</th><th>Changed by</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${escape(target(row.target))}</td><td>${escape(date(row.from))}</td><td>${row.current?badge('Current','active'):escape(date(row.to))}</td><td>${escape(row.operator)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mapping-note">No mappings yet.</p>');
}

const labels={create:'Create mapping',edit:'Edit mapping',delete:'Delete mapping'};
function renderConfirmation(){
 const action=pending.action;
 const destination=action==='delete'?'No tournament selected':target(pending.target);
 $('mappingActionTitle').textContent=action==='create'?'Create mapping?':action==='edit'?'Update mapping?':'Delete mapping?';
 $('mappingActionDescription').hidden=true;
 $('mappingTargetField').hidden=true;$('mappingConfirmation').hidden=false;
 $('backMappingAction').hidden=action==='delete';
 $('confirmMappingAction').textContent=action==='create'?'Create mapping':action==='edit'?'Update mapping':'Delete mapping';
 $('confirmMappingAction').disabled=false;
 $('confirmMappingAction').classList.toggle('mapping-confirm-danger',action==='delete');
 $('mappingConfirmation').innerHTML=`<div class="tournament-confirm-change"><div><span>Current tournament</span><strong>${escape(pending.oldTarget?target(pending.oldTarget):'No tournament selected')}</strong></div><span class="tournament-confirm-arrow" aria-hidden="true">&rarr;</span><div class="${action==='delete'?'tournament-confirm-removed':'tournament-confirm-destination'}"><span>${action==='delete'?'After deletion':'New tournament'}</span><strong>${escape(destination)}</strong></div></div><p class="tournament-confirm-effect">${action==='create'?'This provider tournament will be mapped immediately. Other provider tournament mappings stay unchanged.':action==='edit'?'This provider tournament will use the new tournament immediately. Other provider tournament mappings stay unchanged.':'This provider tournament will become unmapped. The tournament, other provider mappings and mapping history will be kept.'}</p>`;
 pending.stage='confirm';
 (action==='delete'?$('cancelMappingAction'):$('confirmMappingAction')).focus();
}
function open(action,id=''){
 model=api.load();selected=model.source(selected.provider,selected.provId);
 const prerequisite=api.mappingPrerequisite(selected);
 if(action!=='delete'&&!prerequisite.mapped){message(prerequisite.reason,true);render();return;}
 const mapping=model.current(selected);
 if(action!=='create'&&(!mapping||mapping.id!==id)){message('Mapping changed. Review the current mapping and try again.',true);render();return;}
 if(action==='create'&&mapping){message('A mapping already exists. Use Edit mapping.',true);render();return;}
 pending={action,mappingId:id,provider:selected.provider,provId:selected.provId,expectedRevision:selected.revision,oldTarget:mapping?.target||null,stage:'select',target:null};
 $('mappingActionTitle').textContent=labels[action];$('mappingTargetField').hidden=action==='delete';$('mappingActionError').hidden=true;
 $('mappingConfirmation').hidden=true;$('backMappingAction').hidden=true;
 $('mappingActionSource').textContent=selected.provider+' · '+selected.provName+' · '+selected.provId;
 targetPicker.open({enabled:action!=='delete',activeId:mapping?.target||'',selectedId:action==='create'?(params.get('target')||''):''});
 $('mappingActionDescription').hidden=true;$('confirmMappingAction').textContent='Review mapping';
 $('confirmMappingAction').classList.toggle('mapping-confirm-danger',false);
 $('mappingActionModal').style.display='flex';
 if(action==='delete')renderConfirmation();else targetPicker.focus();
}
function createTournament(){
 if(!selected)return;
 close();
 window.CreateTournamentFromProvider({provider:selected.provider,sourceId:selected.provId});
}
$('createTournamentFromProvider').addEventListener('click',createTournament);
$('mappingDetails').addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(b){if(b.dataset.action==='createTournament')createTournament();else open(b.dataset.action,b.dataset.mappingId);}});
$('backMappingAction').addEventListener('click',()=>{
 if(!pending||pending.action==='delete')return;
 pending.stage='select';$('mappingConfirmation').hidden=true;$('mappingTargetField').hidden=false;$('backMappingAction').hidden=true;
 $('mappingActionTitle').textContent=labels[pending.action];$('mappingActionError').hidden=true;
 $('confirmMappingAction').textContent='Review mapping';$('confirmMappingAction').disabled=false;targetPicker.focus();
});
$('confirmMappingAction').addEventListener('click',()=>{
 if(!pending)return;
 try{
  if(pending.stage==='select'){
   const fresh=api.load(),source=fresh.source(pending.provider,pending.provId);
   if(source.revision!==pending.expectedRevision)throw Error('This mapping changed while the form was open. Close it and try again.');
   const choice=$('mappingTarget').value;fresh.target(choice);
   if(choice===pending.oldTarget)throw Error('Select a different tournament.');
   pending.target=choice;renderConfirmation();return;
  }
  const next=api.load();next.apply(pending.provider,pending.provId,pending.action,{mappingId:pending.mappingId,target:pending.target,expectedRevision:pending.expectedRevision});api.save(next);model=next;selected=model.source(pending.provider,pending.provId);$('mappingActionModal').style.display='none';message(pending.action==='delete'?'Mapping deleted. The provider tournament is now unmapped.':pending.action==='edit'?'Mapping updated.':'Mapping created.');pending=null;render();
 }catch(error){$('mappingActionError').hidden=false;$('mappingActionError').textContent=error.message;}
});
function close(){$('mappingActionModal').style.display='none';pending=null;}
['closeMappingAction','cancelMappingAction'].forEach(id=>$(id).addEventListener('click',close));$('mappingActionModal').addEventListener('click',event=>{if(event.target===$('mappingActionModal'))close();});document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
try{
 if(params.get('provId'))selected=model.source(params.get('provider'),params.get('provId'));
 else{const matches=model.state.sources.filter(source=>source.provider===params.get('provider')&&(source.provName===params.get('provName')||(params.get('hermesId')&&model.current(source)?.target===params.get('hermesId'))));if(matches.length!==1)throw Error('Source not found');selected=matches[0];}
}catch{message('Provider tournament was not found. Return to Provider tournaments and select a valid source.',true);}
window.addEventListener('storage',event=>{if(event.key===api.KEY||event.key===window.CategoryMappingDemo.KEY){const key=selected&&[selected.provider,selected.provId];model=api.load();selected=key?model.source(...key):null;render();}});window.addEventListener('focus',()=>{model=api.load();if(selected)selected=model.source(selected.provider,selected.provId);render();});render();
});
