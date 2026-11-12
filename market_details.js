document.addEventListener('DOMContentLoaded', () => {
    const store=MarketStorage.create(localStorage,ExeFeedMarkets),query=new URLSearchParams(location.search),escape=MarketStorage.escape;
    const providerPage=Boolean(document.getElementById('displayProvider'));
    const link=(label,path)=>{const a=document.createElement('a');a.className='btn-action';a.style.cssText='background:#007bff;text-decoration:none;display:inline-block;margin-right:8px';a.textContent=label;a.href=path;return a;};
    const set=(id,value)=>document.getElementById(id).textContent=value;
    function list(id,values){document.getElementById(id).innerHTML=values.length?values.map(v=>'<li>'+escape(v)+'</li>').join(''):'<li>No specifiers configured.</li>';}
    function rules(mapping){return [...mapping.specifiers.map(s=>s.hermesSpecifier+' ← '+s.providerSpecifier),...mapping.fixedSpecifiers.map(s=>s.hermesSpecifier+' = '+s.value),...mapping.extendedSpecifiers.map(s=>s.hermesExtendedSpecifier+' ← '+s.providerValue),...mapping.outcomes.map(o=>o.providerOutcome+' → '+o.hermesOutcome)];}
    function mappingUrl(source,mapping){return 'mapping/mapping.html?provider=ExeFeed&sport='+encodeURIComponent(source.sport)+'&marketId='+encodeURIComponent(source.code)+(mapping?'&mappingId='+encodeURIComponent(mapping.id):'');}
    try{
        const state=store.load();
        if(providerPage){
            const code=query.get('marketId')||query.get('id')||query.get('market');
            const source=ExeFeedMarkets.find(p=>p.code===code||p.name===code);if(!source)throw Error('Provider market not found.');
            set('displayMarketId',source.code);set('displayMarketName',source.name);set('displayProvider','ExeFeed');set('displaySport',source.sport);
            document.getElementById('addMappingBtn').href=mappingUrl(source);
            const definition=document.createElement('div');definition.style.marginTop='20px';
            const attrs=document.createElement('p');attrs.textContent='Attributes: '+(source.specifiers.join(', ')||'None');definition.append(attrs);
            if(source.documentation){const text=document.createElement('p');text.textContent=source.documentation;definition.append(text);}
            const t=document.createElement('table');t.className='markets-table';t.innerHTML='<thead><tr><th>Selection code</th><th>Name</th></tr></thead><tbody>'+source.outcomes.map(o=>'<tr><td>'+escape(o.code)+'</td><td>'+escape(o.name)+'</td></tr>').join('')+'</tbody>';definition.append(t);document.querySelector('section.top-bar').append(definition);
            const body=document.getElementById('mappedMarketsList');const mappings=state.mappings.filter(m=>m.provider==='ExeFeed'&&m.sport===source.sport&&m.sourceId===source.code);
            if(!mappings.length)body.innerHTML='<tr><td colspan="2">No mappings found for this market.</td></tr>';
            else for(const mapping of mappings){
                const target=state.markets.find(m=>m.id===mapping.targetId),tr=document.createElement('tr'),name=document.createElement('td'),actions=document.createElement('td');name.append(document.createTextNode(target?.name||'Market unavailable'));
                const details=document.createElement('ul');rules(mapping).forEach(rule=>{const li=document.createElement('li');li.textContent=rule;details.append(li);});name.append(details);
                actions.append(link('View','view_hermes_market.html?id='+encodeURIComponent(target.id)),link('Edit Mapping',mappingUrl(source,mapping)));
                const remove=document.createElement('button');remove.textContent='Remove';remove.className='btn-remove-mapping';remove.onclick=()=>{if(confirm('Remove this mapping?')){try{store.removeMapping(mapping.id,mapping.revision);location.reload();}catch(e){alert(e.message);}}};actions.append(remove);tr.append(name,actions);body.append(tr);
            }
        }else{
            const market=state.markets.find(m=>m.id===query.get('id'));if(!market)throw Error('Saved Hermes market not found.');
            set('displayMarketId',market.businessId||'Unassigned');set('displayMarketName',market.name);set('displaySport',market.sport);set('displaySportAbbreviation',({Soccer:'SOC',Basketball:'BKB',Tennis:'TEN',Baseball:'BSB'})[market.sport]||'-');set('displayMarketType',market.type);
            document.getElementById('editMarketLink').href='create_market/create_market.html?edit=true&id='+encodeURIComponent(market.id);
            const description=document.createElement('p');description.textContent=market.desc;document.getElementById('displayMarketName').parentElement.after(description);
            list('specifiersList',market.specifiers);list('extendedSpecifiersList',market.extendedSpecifiers);
            document.getElementById('outcomesList').innerHTML=market.outcomes.length?market.outcomes.map(o=>'<tr><td>'+escape(o.name)+'</td><td>'+escape(o.desc)+'</td></tr>').join(''):'<tr><td colspan="2">Outcome type: '+escape(market.outcomesType)+'</td></tr>';
            const body=document.getElementById('providerMarketsList'),mappings=state.mappings.filter(m=>m.targetId===market.id);
            if(!mappings.length)body.innerHTML='<tr><td colspan="3">No provider markets mapped to this market yet.</td></tr>';
            else for(const mapping of mappings){
                const source=ExeFeedMarkets.find(p=>p.code===mapping.sourceId&&p.sport===mapping.sport),tr=document.createElement('tr');const name=document.createElement('td');name.textContent=source.code+' — '+source.name;const provider=document.createElement('td');provider.textContent='ExeFeed';const actions=document.createElement('td');actions.append(link('View Provider Market','view_market.html?marketId='+encodeURIComponent(source.code)),link('Edit Mapping',mappingUrl(source,mapping)));tr.append(name,provider,actions);body.append(tr);
            }
            const add=link('Add provider market','mapping/mapping.html?internalId='+encodeURIComponent(market.id));document.getElementById('editMarketLink').after(add);
        }
    }catch(e){const error=document.createElement('p');error.setAttribute('role','alert');error.style.color='#b42318';error.textContent=e.message;document.querySelector('main').prepend(error);}
});
