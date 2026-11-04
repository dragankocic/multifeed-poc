document.addEventListener('DOMContentLoaded',()=>{
'use strict';
const api=window.CategoryMappingDemo,$=id=>document.getElementById(id),escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let model=api.load(),selected=null,pending=null;
const params=new URLSearchParams(location.search);
if(!params.has('provider')){location.href='category.html?view=provider';return;}
// Return only to this prototype's tournament mapping route, never an arbitrary URL.
const returnProvider=params.get('returnProvider'),returnTournamentId=params.get('returnTournamentId');
const returnToTournament=returnProvider===params.get('provider')&&returnTournamentId
 ? '../tournaments/map_tournament.html?'+new URLSearchParams({provider:returnProvider,provId:returnTournamentId,...(params.get('returnTournamentTarget')?{target:params.get('returnTournamentTarget')}:{})}) : null;
if(returnToTournament){$('mappingBackLink').href=returnToTournament;$('mappingBackLink').textContent='← Back to tournament mapping';}

const targetPicker=window.MappingTargetPicker({getEntities:()=>api.categories,entityName:'category'});
const badge=(text,kind='')=>`<span class="mapping-badge ${kind}">${escape(text)}</span>`;
const date=value=>value?new Date(value).toLocaleString('en-GB',{timeZone:'UTC'})+' UTC':'—';
const target=id=>{const category=api.categories.find(s=>s.id===id);return category?`${category.id} · ${category.name}`:'—';};
const button=(text,action,id='')=>`<button type="button" class="btn-action" data-action="${action}" data-mapping-id="${escape(id)}">${text}</button>`;
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
 $('mappingPageSubtitle').textContent=selected?'':'Return to Provider categories and select a category.';
 $('mappingPageSubtitle').hidden=!!selected;
 $('mappingDetails').hidden=!selected;if(!selected)return;
 const mapping=model.current(selected),category=mapping?api.categories.find(s=>s.id===mapping.target):null;
 $('mappingDetailTitle').textContent=selected.provName;$('mappingDetailSource').textContent=selected.provider+' · '+selected.provId;
 $('mappingCurrent').innerHTML=mapping?`<div class="category-map-master"><span class="category-map-caption">Category</span><strong>${escape(category.name)}</strong><div class="category-map-meta">Category ID ${escape(category.id)}</div><div class="category-map-updated">Last changed ${escape(date(mapping.updatedAt))}</div></div><div class="mapping-actions">${button('Edit mapping','edit',mapping.id)}${button('Delete mapping','delete',mapping.id)}</div>`:`<div class="category-map-master"><span class="category-map-caption">Category</span><strong class="category-map-unmapped">Select a category</strong></div><div class="mapping-actions">${button('Select category','create')}</div>`;
 const rows=previousMappings(selected);
 $('mappingHistory').innerHTML='<div class="mapping-history-heading"><h3>Mapping history</h3></div>'+(rows.length?`<div class="mapping-table-wrap"><table class="mapping-table"><thead><tr><th>Category</th><th>Mapped from</th><th>Mapped until</th><th>Changed by</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${escape(target(row.target))}</td><td>${escape(date(row.from))}</td><td>${escape(date(row.to))}</td><td>${escape(row.operator)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mapping-note">No previous mappings.</p>');
}

const labels={create:'Create mapping',edit:'Edit mapping',delete:'Delete mapping'};
function renderConfirmation(){
 const action=pending.action;
 const destination=action==='delete'?'No category selected':target(pending.target);
 $('mappingActionTitle').textContent=action==='create'?'Create mapping?':action==='edit'?'Update mapping?':'Delete mapping?';
 $('mappingActionDescription').hidden=true;
 $('mappingTargetField').hidden=true;$('mappingConfirmation').hidden=false;
 $('backMappingAction').hidden=action==='delete';
 $('confirmMappingAction').textContent=action==='create'?'Create mapping':action==='edit'?'Update mapping':'Delete mapping';
 $('confirmMappingAction').disabled=false;
 $('confirmMappingAction').classList.toggle('mapping-confirm-danger',action==='delete');
 $('mappingConfirmation').innerHTML=`<div class="category-confirm-change"><div><span>Current category</span><strong>${escape(pending.oldTarget?target(pending.oldTarget):'No category selected')}</strong></div><span class="category-confirm-arrow" aria-hidden="true">&rarr;</span><div class="${action==='delete'?'category-confirm-removed':'category-confirm-destination'}"><span>${action==='delete'?'After deletion':'New category'}</span><strong>${escape(destination)}</strong></div></div><p class="category-confirm-effect">${action==='create'?'This provider category will be mapped immediately. Other provider category mappings stay unchanged.':action==='edit'?'This provider category will use the new category immediately. Other provider category mappings stay unchanged.':'This provider category will become unmapped. The category, other provider mappings and mapping history will be kept.'}</p>`;
 pending.stage='confirm';
 (action==='delete'?$('cancelMappingAction'):$('confirmMappingAction')).focus();
}
function open(action,id=''){
 model=api.load();selected=model.source(selected.provider,selected.provId);
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
$('mappingDetails').addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(b)open(b.dataset.action,b.dataset.mappingId);});
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
   if(choice===pending.oldTarget)throw Error('Select a different category.');
   pending.target=choice;renderConfirmation();return;
  }
  const next=api.load();next.apply(pending.provider,pending.provId,pending.action,{mappingId:pending.mappingId,target:pending.target,expectedRevision:pending.expectedRevision});api.save(next);model=next;selected=model.source(pending.provider,pending.provId);$('mappingActionModal').style.display='none';message(pending.action==='delete'?'Mapping deleted. The provider category is now unmapped.':pending.action==='edit'?'Mapping updated.':'Mapping created.');pending=null;render();if(returnToTournament&&next.current(selected))location.href=returnToTournament;
 }catch(error){$('mappingActionError').hidden=false;$('mappingActionError').textContent=error.message;}
});
function close(){$('mappingActionModal').style.display='none';pending=null;}
['closeMappingAction','cancelMappingAction'].forEach(id=>$(id).addEventListener('click',close));$('mappingActionModal').addEventListener('click',event=>{if(event.target===$('mappingActionModal'))close();});document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
try{
 if(params.get('provId'))selected=model.source(params.get('provider'),params.get('provId'));
 else{const matches=model.state.sources.filter(source=>source.provider===params.get('provider')&&(source.provName===params.get('provName')||(params.get('hermesId')&&model.current(source)?.target===params.get('hermesId'))));if(matches.length!==1)throw Error('Source not found');selected=matches[0];}
}catch{message('Provider category was not found. Return to Provider categories and select a valid source.',true);}
window.addEventListener('storage',event=>{if(event.key===api.KEY){const key=selected&&[selected.provider,selected.provId];model=api.load();selected=key?model.source(...key):null;render();}});render();
});
