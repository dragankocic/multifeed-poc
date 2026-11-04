/* Confirm a new provider association without leaving its master overview. */
(function(root){
'use strict';
let pending=null;
const $=id=>document.getElementById(id);
function close(){ $('masterMappingConfirmModal').style.display='none';pending=null; }
function ensureDialog(){
 if($('masterMappingConfirmModal'))return;
 document.body.insertAdjacentHTML('beforeend',`<div id="masterMappingConfirmModal" class="modal" style="z-index:10050" role="dialog" aria-modal="true" aria-labelledby="masterMappingConfirmTitle">
 <div class="modal-content" style="width:min(560px,92vw);box-sizing:border-box;padding:28px">
 <h3 id="masterMappingConfirmTitle" style="margin:0 0 20px">Create mapping?</h3>
 <div style="padding:18px;background:#f5f8fa;border:1px solid #e0e6ed;border-radius:8px">
 <div style="font-size:12px;color:#687789">Provider entity</div><strong id="masterMappingConfirmSource" style="display:block;margin:6px 0 18px;overflow-wrap:anywhere"></strong>
 <div id="masterMappingConfirmTargetLabel" style="font-size:12px;color:#687789"></div><strong id="masterMappingConfirmTarget" style="display:block;margin-top:6px;overflow-wrap:anywhere"></strong></div>
 <p style="font-size:14px;color:#586674;line-height:1.5;margin:18px 0">This mapping takes effect immediately after confirmation.</p>
 <p id="masterMappingConfirmError" role="alert" hidden style="color:#a32727;font-size:14px"></p>
 <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px"><button type="button" id="masterMappingConfirmCancel" class="btn-secondary" style="display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:10px 18px;border:1px solid #cbd5df;border-radius:6px;background:#fff;color:#34475a;font:inherit;font-size:14px;font-weight:600;line-height:1.4;cursor:pointer">Cancel</button><button type="button" id="masterMappingConfirmSave" class="btn-primary">Create mapping</button></div>
 </div></div>`);
 $('masterMappingConfirmCancel').addEventListener('click',close);
 $('masterMappingConfirmModal').addEventListener('click',e=>{if(e.target===$('masterMappingConfirmModal'))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pending)close();});
 $('masterMappingConfirmSave').addEventListener('click',()=>{
  if(!pending)return;
  try{
   const action=pending,model=action.api.load();
   model.apply(action.provider,action.sourceId,'create',{target:action.targetId,expectedRevision:action.expectedRevision});
   action.api.save(model);close();action.onSaved();
  }catch(error){$('masterMappingConfirmError').textContent=error.message;$('masterMappingConfirmError').hidden=false;}
 });
}
root.MasterMappingAction=function(action){
 ensureDialog();pending=null;
 $('masterMappingConfirmModal').style.display='flex';$('masterMappingConfirmError').hidden=true;
 $('masterMappingConfirmSave').disabled=true;
 try{
  const model=action.api.load(),source=model.source(action.provider,action.sourceId),target=model.target(action.targetId);
  if(action.api.mappingPrerequisite){const prerequisite=action.api.mappingPrerequisite(source);if(!prerequisite.mapped)throw Error(prerequisite.reason);}
  if(model.current(source))throw Error('This provider entity is already mapped. Refresh the available list and try again.');
  pending={...action,expectedRevision:source.revision};
  $('masterMappingConfirmSource').textContent=source.provider+' · '+source.provName+' · '+source.provId;
  $('masterMappingConfirmTargetLabel').textContent=action.entityName.charAt(0).toUpperCase()+action.entityName.slice(1);
  $('masterMappingConfirmTarget').textContent=target.name+' · '+target.id;
  $('masterMappingConfirmSave').disabled=false;$('masterMappingConfirmCancel').focus();
 }catch(error){$('masterMappingConfirmSource').textContent='';$('masterMappingConfirmTarget').textContent='';$('masterMappingConfirmError').textContent=error.message;$('masterMappingConfirmError').hidden=false;}
};
})(window);
