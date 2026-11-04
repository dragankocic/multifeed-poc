/* Shared browser-only create-and-map dialog for provider tournaments. */
(function(root){
'use strict';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
root.CreateTournamentFromProvider=function({provider,sourceId,onSaved}={}){
 const api=root.TournamentMappingDemo;
 let model,source,category;
 try{model=api.load({strict:true});source=model.source(provider,sourceId);category=api.mappingPrerequisite(source);if(model.current(source))throw Error('This provider tournament is already mapped. Use Manage mapping.');}
 catch(error){root.alert(error.message);return;}
 if(document.getElementById('createSourceTournamentDialog'))return;
 const trigger=document.activeElement;
 const snapshot=JSON.stringify([source.provName,source.sport,source.providerCategoryId,category.target,category.targetName]);
 const dialog=document.createElement('div');
 dialog.id='createSourceTournamentDialog';dialog.className='modal';dialog.style.display='flex';
 dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','createSourceTournamentTitle');
 dialog.innerHTML=`<style>
 #createSourceTournamentDialog .modal-content{width:min(660px,94vw);box-sizing:border-box;max-height:90vh;overflow:auto;padding:28px}
 #createSourceTournamentDialog h3{font-size:22px;padding-right:28px;margin-top:0}
 #createSourceTournamentDialog .source-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:20px 0;padding:18px;background:#f4f7f9;border:1px solid #dce5ea;border-radius:8px}
 #createSourceTournamentDialog dt{font-size:12px;color:#667085;margin-bottom:5px}
 #createSourceTournamentDialog dd{margin:0;font-weight:600;overflow-wrap:anywhere}
 #createSourceTournamentDialog label{display:block;margin-bottom:6px;color:#344054;font-size:13px;font-weight:600}
 #createSourceTournamentDialog input,#createSourceTournamentDialog select{width:100%;box-sizing:border-box;min-height:42px;padding:10px 12px;border:1px solid #cfd5dc;border-radius:6px;background:white;font-size:15px}
 #createSourceTournamentDialog .create-field{margin-top:18px}
 #createSourceTournamentDialog .source-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px;margin-top:24px}
 #createSourceTournamentDialog .btn-secondary{padding:10px 16px;min-height:42px;border:1px solid #cfd5dc;border-radius:6px;background:white;color:#344054;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none}
 #createSourceTournamentDialog .source-error,#createSourceTournamentDialog .source-gate{padding:14px;border:1px solid #efd8a9;border-radius:6px;background:#fffaf0;color:#795a26;line-height:1.6}
 #createSourceTournamentDialog .source-error{background:#fff1f0;color:#b42318;border-color:#fecdca}
 #createSourceTournamentDialog .source-note{color:#667085;font-size:14px;line-height:1.6}
 #createSourceTournamentDialog button:disabled{opacity:.5;cursor:not-allowed}
 @media(max-width:560px){#createSourceTournamentDialog .source-facts{grid-template-columns:1fr}}
 </style><div class="modal-content"><button type="button" data-close class="close-modal" aria-label="Close" style="background:none;border:0">&times;</button>
 <h3 id="createSourceTournamentTitle">Create tournament from provider</h3><p class="source-note">Create a tournament and map this provider source to it.</p>
 <dl class="source-facts">${[['Provider',provider],['Provider tournament',source.provName],['Provider ID',source.provId],['Sport',source.sport||'Unavailable'],['Category',category.mapped?category.targetName:'Category mapping required']].map(([label,value])=>`<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>
 <div class="source-gate" ${category.mapped?'hidden':''}><strong>Category mapping required</strong><div>${escape(category.reason)}</div><a href="${escape(category.categoryUrl)}">Map category</a></div>
 <div class="create-field"><label for="sourceTournamentName">Tournament name</label><input id="sourceTournamentName" maxlength="120" value="${escape(source.provName)}" required></div>
 <div class="create-field"><label for="sourceTournamentLeadingFeed">Leading feed provider</label><select id="sourceTournamentLeadingFeed"><option value="EXE">ExeFeed</option><option value="SR">SportRadar</option><option value="BG">SportGenius</option></select></div>
 <p class="source-note">Confirm to create the tournament and its provider mapping together. Only this provider source will be mapped.</p>
 <p class="source-error" data-error role="alert" hidden></p><div class="source-actions"><a class="btn-secondary" style="margin-right:auto" href="map_tournament.html?${escape(new URLSearchParams({provider,provId:sourceId}).toString())}">Map to existing tournament</a><button type="button" class="btn-secondary" data-cancel>Cancel</button><button type="button" class="btn-primary" data-confirm ${category.mapped?'':'disabled'}>Create and map</button></div></div>`;
 document.body.appendChild(dialog);
 const find=selector=>dialog.querySelector(selector),name=find('#sourceTournamentName'),feed=find('#sourceTournamentLeadingFeed'),confirm=find('[data-confirm]');
 function close(){dialog.remove();document.removeEventListener('keydown',keyboard);trigger?.focus();}
 function keyboard(event){
  if(event.key==='Escape')close();
  if(event.key==='Enter'&&event.target===name){event.preventDefault();if(!confirm.disabled)confirm.click();}
  if(event.key==='Tab'){
   const controls=[...dialog.querySelectorAll('button, input, select, a[href]')].filter(item=>!item.disabled&&!item.hidden&&!item.closest('[hidden]'));
   const first=controls[0],last=controls[controls.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 }
 find('[data-close]').addEventListener('click',close);find('[data-cancel]').addEventListener('click',close);
 dialog.addEventListener('click',event=>{if(event.target===dialog)close();});document.addEventListener('keydown',keyboard);
 confirm.addEventListener('click',()=>{
  try{
   const fresh=api.load({strict:true}),current=fresh.source(provider,sourceId),currentCategory=api.mappingPrerequisite(current);
   if(snapshot!==JSON.stringify([current.provName,current.sport,current.providerCategoryId,currentCategory.target,currentCategory.targetName]))throw Error('Provider or category data changed. Close the window and review it again.');
   const tournament=fresh.createFromProvider(provider,sourceId,{name:name.value,primaryFeed:feed.value,expectedRevision:source.revision,expectedCategoryId:category.target});
   api.save(fresh);close();
   if(onSaved)onSaved(tournament.id);else root.location.href='view_tournament.html?'+new URLSearchParams({id:tournament.id});
  }catch(error){find('[data-error]').textContent=error.message;find('[data-error]').hidden=false;}
 });
 name.focus();
};
})(window);
