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
 $('displaySport').textContent=tournament.sport;$('displayCategory').textContent=tournament.category;$('displayPrimaryFeed').textContent=tournament.primaryFeed;
 $('editTournamentLink').href='create_tournament.html?'+new URLSearchParams({edit:'true',id:tournament.id,name:tournament.name,sport:tournament.sport,category:tournament.category,primaryFeed:tournament.primaryFeed});
 $('editTournamentLink').style.display=tournament.deleted?'none':'';
 $('deleteTournamentBtn').style.display=tournament.deleted?'none':'';$('addMappingBtn').style.display=tournament.deleted?'none':'';
 const rows=model.state.sources.filter(source=>model.current(source)?.target===tournamentId||model.draft(source)?.target===tournamentId);
 const activeCount=rows.filter(source=>model.current(source)?.target===tournamentId).length;
 $('mappingCount').textContent=activeCount+' active mapping'+(activeCount===1?'':'s')+' · '+rows.filter(source=>model.draft(source)?.target===tournamentId).length+' drafts';
 $('providerTournamentsList').innerHTML=rows.length?rows.map(source=>{
  const active=model.current(source)?.target===tournamentId,draft=model.draft(source)?.target===tournamentId;
  return `<tr><td>${escape(source.provider)}</td><td>${escape(source.provId)}</td><td>${escape(source.provName)}</td><td>${active?'<span class="mapping-badge active">Active</span>':''} ${draft?'<span class="mapping-badge draft">Draft</span>':''}</td><td style="text-align:right;"><a class="btn-action tournament-action" href="${escape(sourceLink(source))}">Manage mapping</a></td></tr>`;
 }).join(''):'<tr><td colspan="5" class="mapping-empty">No provider tournaments mapped yet. Add a mapping to prepare your first draft.</td></tr>';
}
function renderAvailable(){
 const model=api.load(),provider=$('providerFilter').value,search=$('providerTournamentSearch').value.toLowerCase();
 const rows=model.state.sources.filter(source=>source.provider===provider&&model.current(source)?.target!==tournamentId&&[source.provider,source.provId,source.provName].some(value=>value.toLowerCase().includes(search)));
 $('availableProviderTournamentsList').innerHTML=rows.length?rows.map(source=>{
 const active=model.current(source),draft=model.draft(source);
 return `<tr><td>${escape(source.provider)}</td><td>${escape(source.provId)}</td><td>${escape(source.provName)}</td><td>${active?'Mapped':draft?'Draft available':'Unmapped'}</td><td style="text-align:right;"><a class="btn-action tournament-action" href="${escape(sourceLink(source))}">${active?'Manage mapping':draft?'Continue draft':'Add mapping'}</a></td></tr>`;
 }).join(''):'<tr><td colspan="5" class="mapping-empty">No provider tournaments match these filters.</td></tr>';
}
$('addMappingBtn').addEventListener('click',()=>{$('providerFilter').value='ExeFeed';$('providerTournamentSearch').value='';$('mappingTournamentName').textContent=tournament.name;renderAvailable();$('addMappingModal').style.display='flex';});
$('providerFilter').addEventListener('change',renderAvailable);$('providerTournamentSearch').addEventListener('input',renderAvailable);
$('closeAddMappingModalBtn').addEventListener('click',()=>{$('addMappingModal').style.display='none';});
function closeDelete(){$('deleteTournamentModal').style.display='none';}
$('deleteTournamentBtn').addEventListener('click',()=>{
 const inUse=api.providerRows().some(source=>source.internalId===tournamentId);
 $('deleteTournamentModalText').textContent=inUse?'This tournament has active mappings. Deactivate or replace them before deleting it. Draft and deprecated mappings do not block deletion.':`Delete tournament "${tournament.name}"? Its identity and mapping history will be retained. Drafts targeting it will need another tournament before activation.`;
 $('confirmDeleteTournamentBtn').hidden=inUse;$('confirmDeleteTournamentBtn').style.display=inUse?'none':'';$('cancelDeleteTournamentBtn').textContent=inUse?'Close':'Cancel';$('deleteTournamentModal').style.display='flex';
});
$('confirmDeleteTournamentBtn').addEventListener('click',()=>{try{const model=api.load();model.deleteTournament(tournamentId);api.save(model);location.href='tournament.html';}catch(error){$('deleteTournamentModalText').textContent=error.message;}});
$('cancelDeleteTournamentBtn').addEventListener('click',closeDelete);$('closeDeleteTournamentModalBtn').addEventListener('click',closeDelete);
window.addEventListener('click',event=>{if(event.target===$('addMappingModal'))$('addMappingModal').style.display='none';if(event.target===$('deleteTournamentModal'))closeDelete();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeDelete();$('addMappingModal').style.display='none';}});
window.addEventListener('storage',event=>{if(event.key===api.KEY){render();if($('addMappingModal').style.display==='flex')renderAvailable();}});
render();
});
