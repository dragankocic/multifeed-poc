document.addEventListener('DOMContentLoaded',()=>{
'use strict';
const api=window.CategoryMappingDemo,$=id=>document.getElementById(id),escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let model=api.load(),selected=null,pending=null;
const params=new URLSearchParams(location.search);
const focusedView=params.has('provider');
if(!focusedView){location.href='category.html?view=provider';return;}
const badge=(text,kind='')=>`<span class="mapping-badge ${kind}">${escape(text)}</span>`;
const date=x=>x?new Date(x).toLocaleString('en-GB',{timeZone:'UTC'})+' UTC':'—';
const target=id=>{const s=api.categories.find(s=>s.id===id);return s?`${s.id} · ${s.name}`:'—';};
const button=(text,action,mappingId='')=>`<button type="button" class="btn-action" data-action="${action}" data-mapping-id="${escape(mappingId)}">${text}</button>`;
function message(text,error=false){$('mappingMessage').textContent=text;$('mappingMessage').className='mapping-message'+(error?' error':'');$('mappingMessage').hidden=false;}
function render(){
 $('mappingPageTitle').textContent=selected?'Manage mapping: '+selected.provName:'Mapping not found';
 $('mappingPageSubtitle').textContent=selected?selected.provider+' · Provider category ID: '+selected.provId:'Return to Provider categories and select a category.';
 renderDetails();
}
function renderDetails(){
 $('mappingDetails').hidden=!selected;if(!selected)return;
 const active=model.current(selected),draft=model.draft(selected),history=selected.mappings.filter(m=>m.phase==='Deprecated').sort((a,b)=>b.version-a.version);
 $('mappingDetailTitle').textContent=selected.provName;$('mappingDetailSource').textContent=selected.provider+' · '+selected.provId;
 $('mappingDetailBadges').innerHTML=badge(active?'Mapped':'Unmapped',active?'active':'draft')+(draft?badge('Draft available','draft'):'');
 const targetCard=(id)=>{const category=api.categories.find(s=>s.id===id);return `<div class="mapping-target"><span class="mapping-target-caption">INTERNAL SPORT</span><strong>${escape(category?.name||'—')}</strong><span class="mapping-target-id">Category ID ${escape(id)}</span></div>`;};
 $('mappingCurrent').innerHTML=active?`<div class="mapping-state-heading"><h3>Active mapping</h3>${badge('In use','active')}</div>${targetCard(active.target)}<dl class="mapping-facts"><div><dt>Version</dt><dd>Version ${active.version}</dd></div><div><dt>Valid from</dt><dd>${escape(date(active.validFrom))}</dd></div></dl><div class="mapping-actions">${button('Create new version','replace',active.id)}${button('Deactivate mapping','deprecate',active.id)}</div>${draft?'<p class="mapping-state-hint">A replacement draft is ready. The current mapping stays in use until activation.</p>':''}`:`<div class="mapping-state-heading"><h3>No active mapping</h3>${badge('Not in use','deprecated')}</div><div class="mapping-state-empty"><strong>No category is currently mapped</strong><p>Save and activate a draft to start using a mapping for this provider category.</p></div><div class="mapping-actions">${draft?'':button('Create mapping','create')}</div>`;
 $('mappingDraft').innerHTML=draft?`<div class="mapping-state-heading"><h3>Draft ${active?'replacement':'mapping'}</h3>${badge('Not active','draft')}</div>${targetCard(draft.target)}<dl class="mapping-facts"><div><dt>Version</dt><dd>Assigned on activation</dd></div><div><dt>Effect</dt><dd>${active?'Replaces the active mapping when activated':'Starts being used when activated'}</dd></div></dl><div class="mapping-actions">${button('Activate','activate',draft.id)}${button('Edit draft','edit',draft.id)}${button('Delete draft','delete',draft.id)}</div>`:`<div class="mapping-state-heading"><h3>Draft mapping</h3>${badge('No draft','deprecated')}</div><div class="mapping-state-empty"><strong>No pending changes</strong><p>${active?'Use Create new version to prepare a replacement without changing the active mapping.':'Create a mapping to prepare a draft. It will take effect only after activation.'}</p></div>`;
 if(active&&draft)$('mappingCurrent').querySelector('[data-action="replace"]').disabled=true;
 $('mappingHistory').innerHTML=`<div class="mapping-history-heading"><h3>Mapping history</h3><span class="mapping-subtext">Previous versions and their validity periods</span></div>`+(history.length?`<div class="mapping-table-wrap"><table class="mapping-table"><thead><tr><th>Version</th><th>Category</th><th>Status</th><th>Valid from</th><th>Valid to</th><th>Operator</th></tr></thead><tbody>${history.map(m=>`<tr><td>${m.version}</td><td>${escape(target(m.target))}</td><td>${badge('Deprecated','deprecated')}</td><td>${escape(date(m.validFrom))}</td><td>${escape(date(m.validTo))}</td><td>${escape(m.operator)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mapping-note">No previous versions.</p>');
}
const labels={create:'Create mapping',replace:'Create new version',edit:'Edit draft',activate:'Activate mapping',deprecate:'Deactivate mapping',delete:'Delete draft'};
function open(action,id=''){
 const mapping=id?model.mapping(selected,id):null;pending={action,mappingId:id,provider:selected.provider,provId:selected.provId};
 $('mappingActionTitle').textContent=labels[action];$('mappingTargetField').hidden=!['create','replace','edit'].includes(action);$('mappingActionError').hidden=true;
 const active=model.current(selected);$('mappingTarget').innerHTML='<option value="">Select a category</option>'+api.categories.filter(s=>!s.deleted).map(s=>`<option value="${s.id}" ${active?.target===s.id&&action!=='create'?'disabled':''}>${escape(s.id+' · '+s.name)}${active?.target===s.id?' (currently active)':''}</option>`).join('');if(action==='edit')$('mappingTarget').value=mapping.target;else if(action==='create'&&params.get('target'))$('mappingTarget').value=params.get('target');
 const descriptions={create:'Save a draft mapping. It will not be used until activation.',replace:'Prepare a different target as a draft. The current mapping stays active until the replacement is activated.',edit:'Only the draft changes. The currently active mapping is preserved.',activate:active?'Activate this draft and end the previous active version at the same time? The previous version will be retained as Deprecated.':'Activate this draft? It will become the current mapping.',deprecate:'This mapping will stop being used. Its history will remain available. The category itself will not be disabled. Any existing draft will be preserved.',delete:'Delete this draft? The active mapping and historical versions will be preserved.'};
 $('mappingActionDescription').textContent=descriptions[action];$('confirmMappingAction').textContent=['create','replace','edit'].includes(action)?'Save draft':labels[action];$('mappingActionModal').style.display='flex';
}
$('mappingDetails').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b)open(b.dataset.action,b.dataset.mappingId);});
$('confirmMappingAction').addEventListener('click',()=>{
 if(!pending)return;try{const next=api.load();next.apply(pending.provider,pending.provId,pending.action,{mappingId:pending.mappingId,target:$('mappingTarget').value});api.save(next);model=next;selected=model.source(pending.provider,pending.provId);$('mappingActionModal').style.display='none';message(pending.action==='deprecate'?'Mapping deactivated. It is now Deprecated; its history is retained.':pending.action==='activate'?'Mapping activated. The active mapping and history have been updated.':pending.action==='delete'?'Draft deleted. Existing active and historical mappings were preserved.':'Draft saved. Activate it when ready.');render();}catch(error){$('mappingActionError').hidden=false;$('mappingActionError').textContent=error.message;}
});
function close(){$('mappingActionModal').style.display='none';pending=null;}
['closeMappingAction','cancelMappingAction'].forEach(id=>$(id).addEventListener('click',close));$('mappingActionModal').addEventListener('click',e=>{if(e.target===$('mappingActionModal'))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
try{
 if(params.get('provId')) selected=model.source(params.get('provider'),params.get('provId'));
 else {
  const matches=model.state.sources.filter(source=>source.provider===params.get('provider')&&(source.provName===params.get('provName')||(params.get('hermesId')&&model.current(source)?.target===params.get('hermesId'))));
  if(matches.length!==1)throw Error('Source not found');selected=matches[0];
 }
}catch{message('Provider category was not found. Return to Provider categories and select a valid source.',true);}
window.addEventListener('storage',e=>{if(e.key===api.KEY){const key=selected&&[selected.provider,selected.provId];model=api.load();selected=key?model.source(...key):null;render();}});render();
});
