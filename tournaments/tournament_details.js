document.addEventListener('DOMContentLoaded', () => {
'use strict';
const api=TournamentMappingDemo,$=id=>document.getElementById(id);
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search),tournamentId=params.get('id')||'';
let tournament;
const sourceLink=source=>'map_tournament.html?'+new URLSearchParams({provider:source.provider,provId:source.provId,target:tournamentId});
function render(){
 const model=api.load();tournament=model.state.tournaments.find(c=>c.id===tournamentId);
 if(!tournament){location.href='tournament.html';return;}
 $('displayTournamentName').textContent=tournament.name+(tournament.deleted?' (deleted)':'');$('displayTournamentId').textContent=tournament.id;
 $('tournamentCreationSource').hidden=!tournament.createdFrom;
 $('tournamentCreationSourceValue').textContent=tournament.createdFrom?tournament.createdFrom.provider+' · '+tournament.createdFrom.provId:'';
 $('displaySport').textContent=tournament.sport;$('displayCategory').textContent=tournament.category;$('displayPrimaryFeed').textContent=tournament.primaryFeed;
 $('editTournamentLink').href='create_tournament.html?'+new URLSearchParams({edit:'true',id:tournament.id,name:tournament.name,sport:tournament.sport,category:tournament.category,primaryFeed:tournament.primaryFeed});
 $('editTournamentLink').style.display=tournament.deleted?'none':'';
 $('deleteTournamentBtn').style.display=tournament.deleted?'none':'';$('addMappingBtn').style.display=tournament.deleted?'none':'';
 const rows=model.state.sources.filter(source=>model.current(source)?.target===tournamentId);
 const activeCount=rows.filter(source=>model.current(source)?.target===tournamentId).length;
 $('mappingCount').textContent=activeCount+' mapping'+(activeCount===1?'':'s');
 $('providerTournamentsList').innerHTML=rows.length?rows.map(source=>{
  const active=model.current(source)?.target===tournamentId;
  return `<tr><td><div class="overview-provider"><span class="overview-provider-icon" aria-hidden="true">${escape(source.provider.slice(0,1))}</span>${escape(source.provider)}</div></td><td><span class="overview-source-name">${escape(source.provName)}</span><span class="overview-source-id">${escape(source.provId)}</span></td><td style="text-align:right;"><a class="btn-action tournament-action" href="${escape(sourceLink(source))}">Manage mapping</a></td></tr>`;
 }).join(''):'<tr><td colspan="3" class="mapping-empty">No provider tournaments mapped yet. Add a provider tournament mapping.</td></tr>';
}
function renderAvailable(){
 const model=api.load(),provider=$('providerFilter').value,search=$('providerTournamentSearch').value.toLowerCase();
 const rows=model.state.sources.filter(source=>source.provider===provider&&!model.current(source)&&source.sport===tournament.sport&&(!api.mappingPrerequisite(source).mapped||(tournament.categoryId?api.mappingPrerequisite(source).target===tournament.categoryId:api.mappingPrerequisite(source).targetName===tournament.category))&&[source.provider,source.provId,source.provName].some(value=>value.toLowerCase().includes(search)));
 $('availableProviderTournamentsList').innerHTML=rows.length?rows.map(source=>{
 const active=model.current(source),category=api.mappingPrerequisite(source,{targetId:tournamentId});
 return `<tr><td>${escape(source.provider)}</td><td>${escape(source.provId)}</td><td>${escape(source.provName)}${!category.mapped?'<div style="color:#a06b19;font-size:12px">Category mapping required</div>':''}</td><td>${active?'Mapped':'Unmapped'}</td><td style="text-align:right;"><button type="button" class="btn-action tournament-action" data-provider="${escape(source.provider)}" data-source-id="${escape(source.provId)}" ${category.mapped?'':'disabled'}>Map</button>${!category.mapped?`<a href="${escape(category.categoryUrl)}" class="btn-action tournament-action" style="margin-left:8px">Map category</a>`:''}</td></tr>`;
 }).join(''):'<tr><td colspan="5" class="mapping-empty">No provider tournaments match these filters.</td></tr>';
}
$('availableProviderTournamentsList').addEventListener('click',event=>{
 const button=event.target.closest('[data-source-id]');if(!button)return;
 window.MasterMappingAction({api,provider:button.dataset.provider,sourceId:button.dataset.sourceId,targetId:tournamentId,entityName:'tournament',onSaved:()=>{$('addMappingModal').style.display='none';render();renderAvailable();}});
});
$('addMappingBtn').addEventListener('click',()=>{$('providerFilter').value='ExeFeed';$('providerTournamentSearch').value='';$('mappingTournamentName').textContent=tournament.name;renderAvailable();$('addMappingModal').style.display='flex';});
$('providerFilter').addEventListener('change',renderAvailable);$('providerTournamentSearch').addEventListener('input',renderAvailable);
$('closeAddMappingModalBtn').addEventListener('click',()=>{$('addMappingModal').style.display='none';});
function closeDelete(){$('deleteTournamentModal').style.display='none';}
$('deleteTournamentBtn').addEventListener('click',()=>{
 const inUse=api.providerRows().some(source=>source.internalId===tournamentId);
 $('deleteTournamentModalText').textContent=inUse?'This tournament has mappings. Delete or update them before deleting the tournament.':`Delete tournament "${tournament.name}"? Its identity and mapping history will be retained.`;
 $('confirmDeleteTournamentBtn').hidden=inUse;$('confirmDeleteTournamentBtn').style.display=inUse?'none':'';$('cancelDeleteTournamentBtn').textContent=inUse?'Close':'Cancel';$('deleteTournamentModal').style.display='flex';
});
$('confirmDeleteTournamentBtn').addEventListener('click',()=>{try{const model=api.load();model.deleteTournament(tournamentId);api.save(model);location.href='tournament.html';}catch(error){$('deleteTournamentModalText').textContent=error.message;}});
$('cancelDeleteTournamentBtn').addEventListener('click',closeDelete);$('closeDeleteTournamentModalBtn').addEventListener('click',closeDelete);
window.addEventListener('click',event=>{if(event.target===$('addMappingModal'))$('addMappingModal').style.display='none';if(event.target===$('deleteTournamentModal'))closeDelete();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeDelete();$('addMappingModal').style.display='none';}});
window.addEventListener('storage',event=>{if(event.key===api.KEY||event.key===window.CategoryMappingDemo.KEY){render();if($('addMappingModal').style.display==='flex')renderAvailable();}});
window.addEventListener('focus',()=>{render();if($('addMappingModal').style.display==='flex')renderAvailable();});
render();
});
