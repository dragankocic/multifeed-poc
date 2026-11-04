/* Browser projection reads only: tournament and competitor demo mappings are unchanged. */
(function(root){
'use strict';
root.EventMappingProjectionDemo={
 snapshot(){
  try{
   const sportRaw=localStorage.getItem(root.SportMappingDemo.KEY),categoryRaw=localStorage.getItem(root.CategoryMappingDemo.KEY);
   const sports=sportRaw?JSON.parse(sportRaw):null,categories=categoryRaw?JSON.parse(categoryRaw):null;
   if(sports&&(![1,2].includes(sports.schema)||!Array.isArray(sports.sources)))throw Error('Invalid sport mapping data.');
   if(categories&&(![1,2].includes(categories.schema)||!Array.isArray(categories.sources)||!Array.isArray(categories.categories)))throw Error('Invalid category mapping data.');
   return {ok:true,sports:new root.SportMappingDemo.Model(sports||undefined),categories:new root.CategoryMappingDemo.Model(categories||undefined)};
  }catch(error){return {ok:false,error:'Mapping data is unavailable.'};}
 },
 resolve(snapshot,{provider,sourceSportId,sourceCategoryId}){
  if(!snapshot.ok)return {ok:false,error:snapshot.error};
  try{
   const sportSource=snapshot.sports.state.sources.find(source=>source.provider===provider&&source.provId===sourceSportId);
   const categorySource=snapshot.categories.state.sources.find(source=>source.provider===provider&&source.provId===sourceCategoryId);
   const sportMapping=sportSource?snapshot.sports.current(sportSource):null,categoryMapping=categorySource?snapshot.categories.current(categorySource):null;
   const sport=sportMapping?root.SportMappingDemo.sports.find(item=>item.id===sportMapping.target):null;
   const category=categoryMapping?snapshot.categories.state.categories.find(item=>item.id===categoryMapping.target&&!item.deleted):null;
   return {ok:true,sport:sport?{id:sport.id,name:sport.name}:null,category:category?{id:category.id,name:category.name}:null};
  }catch(error){return {ok:false,error:'Mapping data is unavailable.'};}
 }
};
})(window);
