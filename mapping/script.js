document.addEventListener('DOMContentLoaded', () => {
    const store=MarketStorage.create(localStorage,ExeFeedMarkets);
    const query=new URLSearchParams(location.search),container=document.getElementById('dynamicSections');
    const providerSelect=document.getElementById('providerMarketSelect');
    const add=document.getElementById('addMappingBtn'),view=document.getElementById('viewMarketBtn');
    const error=document.createElement('p');error.setAttribute('role','alert');error.style.color='#b42318';container.before(error);
    let source;
    const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
    const button=(text,handler,cls='btn-secondary')=>{const b=node('button',text,cls);b.type='button';b.onclick=handler;return b;};
    function select(items,value=''){const n=node('select');n.add(new Option('Select...',''));items.forEach(([value,label])=>n.add(new Option(label,value)));n.value=value;return n;}
    function field(label,input){const box=node('label',undefined,'form-group');box.append(node('span',label),input);return box;}
    function showJson(title,data){document.getElementById('jsonModalTitle').textContent=title;document.getElementById('jsonContent').textContent=JSON.stringify(data,null,2);document.getElementById('jsonModal').style.display='flex';}
    document.getElementById('closeModalBtn').onclick=()=>document.getElementById('jsonModal').style.display='none';
    document.getElementById('jsonModal').addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.style.display='none';});
    function card(saved){
        const cardSource=source;
        const section=node('div',undefined,'mapping-card');section.style.backgroundColor='white';
        const state=store.load(),targets=state.markets.filter(m=>m.sport===cardSource.sport);
        const targetSelect=select(targets.map(m=>[m.id,m.name]),saved?.targetId||query.get('internalId')||'');targetSelect.className='hermes-market-select';
        section.append(node('h4',saved?'Saved mapping':'New mapping'));
        const titleRow=node('div',undefined,'form-row');const type=node('input');type.readOnly=true;type.className='hermes-market-type-display';titleRow.append(field('Choose Market',targetSelect),field('Market Type',type));section.append(titleRow);
        const details=node('div',undefined,'mapping-details-wrapper');section.append(details);
        const status=node('p');status.setAttribute('role','status');section.append(status);
        let controls;
        function render(){
            details.replaceChildren();controls={spec:[],ext:[],outcomes:[]};
            const target=targets.find(t=>t.id===targetSelect.value);type.value=target?.type||'';if(!target)return;
            const previous=saved?.targetId===target.id?saved:null;
            if(target.specifiers.length)details.append(node('h4','Specifiers Mapping'));
            for(const name of target.specifiers){
                const row=node('div',undefined,'form-row');const fixedRow=previous?.fixedSpecifiers.find(s=>s.hermesSpecifier===name),mappedRow=previous?.specifiers.find(s=>s.hermesSpecifier===name);
                const mode=select([['provider','Mapped from Provider'],['fixed','Fixed Value']],fixedRow?'fixed':'provider');
                const attribute=select(cardSource.specifiers.map(s=>[s,s]),mappedRow?.providerSpecifier||'');const value=node('input');value.type='text';value.value=fixedRow?.value||'';value.placeholder='e.g. 2.5';
                const attrField=field('Provider market specifier',attribute),fixedField=field('Fixed Specifier Value',value);
                const toggle=()=>{attrField.style.display=mode.value==='provider'?'':'none';fixedField.style.display=mode.value==='fixed'?'':'none';};mode.onchange=toggle;
                row.append(field('Hermes specifier: '+name,mode),attrField,fixedField);details.append(row);toggle();controls.spec.push({name,mode,attribute,value});
            }
            if(target.extendedSpecifiers.length)details.append(node('h4','Extended specifiers mapping'));
            for(const name of target.extendedSpecifiers){const previousRow=previous?.extendedSpecifiers.find(s=>s.hermesExtendedSpecifier===name);const input=select([...new Set([...cardSource.specifiers,...cardSource.extendedSpecifiers])].map(s=>[s,s]),previousRow?.providerValue||'');details.append(field(name+' — provider attribute',input));controls.ext.push({name,input});}
            details.append(node('h4','Outcome mapping'));
            if(target.outcomesType!=='Regular'){details.append(node('p','The documented ExeFeed markets use explicit selections. Choose a Hermes market with Regular outcomes.'));return;}
            for(const outcome of cardSource.outcomes){const previousRow=previous?.outcomes.find(o=>o.providerOutcome===outcome.code);const input=select(target.outcomes.map(o=>[o.name,o.name]),previousRow?.hermesOutcome||'');input.className='hermes-outcome-select';details.append(field(outcome.code+' — '+outcome.name,input));controls.outcomes.push({code:outcome.code,input});}
        }
        function definition(){return {id:saved?.id,revision:saved?.revision,provider:cardSource.provider,sourceId:cardSource.code,sport:cardSource.sport,targetId:targetSelect.value,
            specifiers:controls.spec.filter(c=>c.mode.value==='provider').map(c=>({providerSpecifier:c.attribute.value,hermesSpecifier:c.name})),
            fixedSpecifiers:controls.spec.filter(c=>c.mode.value==='fixed').map(c=>({value:c.value.value.trim(),hermesSpecifier:c.name})),
            extendedSpecifiers:controls.ext.map(c=>({providerValue:c.input.value,hermesExtendedSpecifier:c.name})),
            outcomes:controls.outcomes.map(c=>({providerOutcome:c.code,hermesOutcome:c.input.value}))};}
        targetSelect.onchange=()=>{status.textContent='';render();};render();
        const actions=node('div',undefined,'form-row');actions.style.cssText='justify-content:flex-end;margin-top:24px;gap:10px';
        actions.append(button('View mapping',()=>showJson('Mapping Definition',definition())),button('Reset',()=>{targetSelect.value=saved?.targetId||'';render();status.textContent='';}),button('Cancel',()=>section.remove()),button('Save mapping',()=>{try{saved=store.saveMapping(definition());status.style.color='#167447';status.textContent='Mapping saved in this browser.';}catch(e){status.style.color='#b42318';status.textContent=e.message;}},'btn-primary'));
        section.append(actions);container.append(section);
    }
    function load(){
        container.replaceChildren();error.textContent='';source=ExeFeedMarkets.find(p=>p.code===providerSelect.value);
        for(const b of [add,view]){b.disabled=!source;b.style.opacity=source?'1':'0.5';b.style.cursor=source?'pointer':'not-allowed';}
        if(!source)return;
        query.set('marketId',source.code);
        history.replaceState(null,'',location.pathname+'?'+query.toString());
        document.getElementById('displayProvider').textContent='ExeFeed';document.getElementById('displaySport').textContent=source.sport;
        const state=store.load(),existing=state.mappings.filter(m=>m.provider==='ExeFeed'&&m.sourceId===source.code&&m.sport===source.sport);
        const edit=query.get('mappingId');
        if(edit&&!existing.some(m=>m.id===edit))throw Error('The requested mapping was not found.');
        existing.forEach(card);
        if(query.get('internalId')&&!existing.some(m=>m.targetId===query.get('internalId')))card();
    }
    try{
        ExeFeedMarkets.forEach(p=>providerSelect.add(new Option(p.code+' — '+p.name,p.code)));
        providerSelect.value=query.get('marketId')||query.get('market')||'';
        providerSelect.onchange=()=>{query.delete('mappingId');try{load();}catch(e){error.textContent=e.message;}};
        view.onclick=()=>showJson('Provider Market Data',source);
        add.onclick=()=>{try{if(!store.load().markets.some(m=>m.sport===source.sport)){error.textContent='Create a Hermes market for this sport first.';const a=node('a','Create market');a.href='../create_market/create_market.html';error.append(document.createTextNode(' '),a);return;}card();}catch(e){error.textContent=e.message;}};
        load();
    }catch(e){error.textContent=e.message;}
});
