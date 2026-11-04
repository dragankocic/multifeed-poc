/* Shared searchable master-target picker for versioned mapping forms. */
(function(root){
'use strict';
root.MappingTargetPicker=function({getEntities,entityName}){
 const $=id=>document.getElementById(id);
 const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const normalize=value=>String(value??'').normalize('NFKC').toLowerCase();
 const metadata=entity=>[entity.id,entity.sport,entity.category,entity.abbr].filter(Boolean).join(' · ');
 let entities=[],activeTarget='',editing=false;
 function validSelection(){return entities.find(entity=>entity.id===$('mappingTarget').value&&entity.id!==activeTarget);}
 function updateSelection(){
  const selected=validSelection();
  $('mappingTargetList').querySelectorAll('input[type="radio"]').forEach(input=>{
   input.checked=input.value===$('mappingTarget').value;
   input.closest('.master-target-row').classList.toggle('is-selected',input.checked);
  });
  $('mappingTargetSelection').textContent=selected?'Selected: '+selected.name+' · '+selected.id:'No '+entityName+' selected';
  $('mappingTargetSelection').classList.toggle('has-selection',!!selected);
  $('confirmMappingAction').disabled=editing&&!selected;
 }
 function render(){
  const terms=normalize($('mappingTargetSearch').value).trim().split(/\s+/).filter(Boolean);
  const rows=entities.filter(entity=>terms.every(term=>normalize([entity.id,entity.name,entity.sport,entity.category,entity.abbr].filter(Boolean).join(' ')).includes(term)));
  $('mappingTargetCount').textContent=rows.length+' result'+(rows.length===1?'':'s');
  $('mappingTargetList').innerHTML=rows.length?rows.map(entity=>{
   const blocked=entity.id===activeTarget,checked=entity.id===$('mappingTarget').value;
   return `<label class="master-target-row${checked?' is-selected':''}${blocked?' is-unavailable':''}"><input type="radio" name="mappingMasterTarget" value="${escape(entity.id)}" ${checked?'checked':''} ${blocked?'disabled':''}><span class="master-target-identity"><strong>${escape(entity.name)}</strong><span>${escape(metadata(entity))}</span></span>${blocked?'<span class="master-target-state">Currently active</span>':''}</label>`;
  }).join(''):'<div class="master-target-empty">No matching '+escape(entityName==='category'?'categories':entityName+'s')+' found.</div>';
  updateSelection();
 }
 $('mappingTargetSearch').addEventListener('input',render);
 $('mappingTargetList').addEventListener('change',event=>{
  const input=event.target;
  if(input.name!=='mappingMasterTarget'||input.disabled)return;
  if(!entities.some(entity=>entity.id===input.value&&entity.id!==activeTarget))return;
  $('mappingTarget').value=input.value;$('mappingActionError').hidden=true;updateSelection();
 });
 return {
  open({enabled,activeId='',selectedId=''}){
   editing=enabled;activeTarget=activeId;entities=getEntities().filter(entity=>!entity.deleted);
   $('mappingTargetSearch').value='';
   $('mappingTarget').value=enabled&&entities.some(entity=>entity.id===selectedId&&entity.id!==activeTarget)?selectedId:'';
   render();
  },
  focus(){if(editing)$('mappingTargetSearch').focus();}
 };
};
})(window);
