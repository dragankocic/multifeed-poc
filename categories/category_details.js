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
 const rows=model.state.sources.filter(source=>model.current(source)?.target===categoryId||model.draft(source)?.target===categoryId);
 const activeCount=rows.filter(source=>model.current(source)?.target===categoryId).length;
 $('mappingCount').textContent=activeCount+' active mapping'+(activeCount===1?'':'s')+' · '+rows.filter(source=>model.draft(source)?.target===categoryId).length+' drafts';
 $('providerCategoriesList').innerHTML=rows.length?rows.map(source=>{
  const active=model.current(source)?.target===categoryId,draft=model.draft(source)?.target===categoryId;
  return `<tr><td>${escape(source.provider)}</td><td>${escape(source.provId)}</td><td>${escape(source.provName)}</td><td>${active?'<span class="mapping-badge active">Active</span>':''} ${draft?'<span class="mapping-badge draft">Draft</span>':''}</td><td style="text-align:right;"><a class="btn-action category-action" href="${escape(sourceLink(source))}">Manage mapping</a></td></tr>`;
 }).join(''):'<tr><td colspan="5" class="mapping-empty">No provider categories mapped yet. Add a mapping to prepare your first draft.</td></tr>';
}
function renderAvailable(){
 const model=api.load(),provider=$('providerFilter').value,search=$('providerCategorySearch').value.toLowerCase();
 const rows=model.state.sources.filter(source=>source.provider===provider&&model.current(source)?.target!==categoryId&&[source.provider,source.provId,source.provName].some(value=>value.toLowerCase().includes(search)));
 $('availableProviderCategoriesList').innerHTML=rows.length?rows.map(source=>{
 const active=model.current(source),draft=model.draft(source);
 return `<tr><td>${escape(source.provider)}</td><td>${escape(source.provId)}</td><td>${escape(source.provName)}</td><td>${active?'Mapped':draft?'Draft available':'Unmapped'}</td><td style="text-align:right;"><a class="btn-action category-action" href="${escape(sourceLink(source))}">${active?'Manage mapping':draft?'Continue draft':'Add mapping'}</a></td></tr>`;
 }).join(''):'<tr><td colspan="5" class="mapping-empty">No provider categories match these filters.</td></tr>';
}
$('addMappingBtn').addEventListener('click',()=>{$('providerFilter').value='ExeFeed';$('providerCategorySearch').value='';$('mappingCategoryName').textContent=category.name;renderAvailable();$('addMappingModal').style.display='flex';});
$('providerFilter').addEventListener('change',renderAvailable);$('providerCategorySearch').addEventListener('input',renderAvailable);
$('closeAddMappingModalBtn').addEventListener('click',()=>{$('addMappingModal').style.display='none';});
function closeDelete(){$('deleteCategoryModal').style.display='none';}
$('deleteCategoryBtn').addEventListener('click',()=>{
 const inUse=api.providerRows().some(source=>source.internalId===categoryId);
 $('deleteCategoryModalText').textContent=inUse?'This category has active mappings. Deactivate or replace them before deleting it. Draft and deprecated mappings do not block deletion.':`Delete category "${category.name}"? Its identity and mapping history will be retained. Drafts targeting it will need another category before activation.`;
 $('confirmDeleteCategoryBtn').hidden=inUse;$('confirmDeleteCategoryBtn').style.display=inUse?'none':'';$('cancelDeleteCategoryBtn').textContent=inUse?'Close':'Cancel';$('deleteCategoryModal').style.display='flex';
});
$('confirmDeleteCategoryBtn').addEventListener('click',()=>{try{const model=api.load();model.deleteCategory(categoryId);api.save(model);location.href='category.html';}catch(error){$('deleteCategoryModalText').textContent=error.message;}});
$('cancelDeleteCategoryBtn').addEventListener('click',closeDelete);$('closeDeleteCategoryModalBtn').addEventListener('click',closeDelete);
window.addEventListener('click',event=>{if(event.target===$('addMappingModal'))$('addMappingModal').style.display='none';if(event.target===$('deleteCategoryModal'))closeDelete();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeDelete();$('addMappingModal').style.display='none';}});
window.addEventListener('storage',event=>{if(event.key===api.KEY){render();if($('addMappingModal').style.display==='flex')renderAvailable();}});
render();
});
