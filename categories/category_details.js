document.addEventListener('DOMContentLoaded', () => {
'use strict';
const api=CategoryMappingDemo,$=id=>document.getElementById(id);
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search),categoryId=(params.get('id')||'').replace(/^C-0*(\d+)$/,'$1');
let category;
const sourceLink=source=>'map_category.html?'+new URLSearchParams({provider:source.provider,provId:source.provId,target:categoryId});
function render(){
 const model=api.load();category=model.state.categories.find(c=>c.id===categoryId);
 if(!category){location.href='category.html';return;}
 $('displayCategoryName').textContent=category.name+(category.deleted?' (deleted)':'');$('displayCategoryId').textContent=category.id;
 $('editCategoryLink').href='create_category.html?'+new URLSearchParams({edit:'true',id:category.id,name:category.name});
 $('editCategoryLink').style.display=category.deleted?'none':'';
 $('deleteCategoryBtn').style.display=category.deleted?'none':'';$('addMappingBtn').style.display=category.deleted?'none':'';
 const rows=model.state.sources.filter(source=>model.current(source)?.target===categoryId);
 const activeCount=rows.filter(source=>model.current(source)?.target===categoryId).length;
 $('mappingCount').textContent=activeCount+' mapping'+(activeCount===1?'':'s');
 $('providerCategoriesList').innerHTML=rows.length?rows.map(source=>{
  const active=model.current(source)?.target===categoryId;
  return `<tr><td><div class="overview-provider"><span class="overview-provider-icon" aria-hidden="true">${escape(source.provider.slice(0,1))}</span>${escape(source.provider)}</div></td><td><span class="overview-source-name">${escape(source.provName)}</span><span class="overview-source-id">${escape(source.provId)}</span></td><td style="text-align:right;"><a class="btn-action category-action" href="${escape(sourceLink(source))}">Manage mapping</a></td></tr>`;
 }).join(''):'<tr><td colspan="3" class="mapping-empty">No provider categories mapped yet. Add a provider category mapping.</td></tr>';
}
function renderAvailable(){
 const model=api.load(),provider=$('providerFilter').value,search=$('providerCategorySearch').value.toLowerCase();
 const rows=model.state.sources.filter(source=>source.provider===provider&&!model.current(source)&&[source.provider,source.provId,source.provName].some(value=>value.toLowerCase().includes(search)));
 $('availableProviderCategoriesList').innerHTML=rows.length?rows.map(source=>{
 const active=model.current(source);
 return `<tr><td>${escape(source.provider)}</td><td>${escape(source.provId)}</td><td>${escape(source.provName)}</td><td>${active?'Mapped':'Unmapped'}</td><td style="text-align:right;"><button type="button" class="btn-action category-action" data-provider="${escape(source.provider)}" data-source-id="${escape(source.provId)}">Map</button></td></tr>`;
 }).join(''):'<tr><td colspan="5" class="mapping-empty">No provider categories match these filters.</td></tr>';
}
$('availableProviderCategoriesList').addEventListener('click',event=>{
 const button=event.target.closest('[data-source-id]');if(!button)return;
 window.MasterMappingAction({api,provider:button.dataset.provider,sourceId:button.dataset.sourceId,targetId:categoryId,entityName:'category',onSaved:()=>{$('addMappingModal').style.display='none';render();renderAvailable();}});
});
$('addMappingBtn').addEventListener('click',()=>{$('providerFilter').value='ExeFeed';$('providerCategorySearch').value='';$('mappingCategoryName').textContent=category.name;renderAvailable();$('addMappingModal').style.display='flex';});
$('providerFilter').addEventListener('change',renderAvailable);$('providerCategorySearch').addEventListener('input',renderAvailable);
$('closeAddMappingModalBtn').addEventListener('click',()=>{$('addMappingModal').style.display='none';});
function closeDelete(){$('deleteCategoryModal').style.display='none';}
$('deleteCategoryBtn').addEventListener('click',()=>{
 const inUse=api.providerRows().some(source=>source.internalId===categoryId);
 $('deleteCategoryModalText').textContent=inUse?'This category has mappings. Delete or update them before deleting the category.':`Delete category "${category.name}"? Its identity and mapping history will be retained.`;
 $('confirmDeleteCategoryBtn').hidden=inUse;$('confirmDeleteCategoryBtn').style.display=inUse?'none':'';$('cancelDeleteCategoryBtn').textContent=inUse?'Close':'Cancel';$('deleteCategoryModal').style.display='flex';
});
$('confirmDeleteCategoryBtn').addEventListener('click',()=>{try{const model=api.load();model.deleteCategory(categoryId);api.save(model);location.href='category.html';}catch(error){$('deleteCategoryModalText').textContent=error.message;}});
$('cancelDeleteCategoryBtn').addEventListener('click',closeDelete);$('closeDeleteCategoryModalBtn').addEventListener('click',closeDelete);
window.addEventListener('click',event=>{if(event.target===$('addMappingModal'))$('addMappingModal').style.display='none';if(event.target===$('deleteCategoryModal'))closeDelete();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeDelete();$('addMappingModal').style.display='none';}});
window.addEventListener('storage',event=>{if(event.key===api.KEY){render();if($('addMappingModal').style.display==='flex')renderAvailable();}});
render();
});
