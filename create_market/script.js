document.addEventListener('DOMContentLoaded', () => {
    const store = MarketStorage.create(localStorage, ExeFeedMarkets);
    const query = new URLSearchParams(location.search);
    const error = document.createElement('p'); error.setAttribute('role','alert'); error.style.color='#b42318';
    document.getElementById('saveMarketBtn').before(error);
    let original;
    function selected(name) { return document.querySelector(`input[name="${name}"]:checked`)?.value; }
    function choices(extended) {
        const defaults = extended ? ['score','period','total_for_the_rest','hcp_for_the_rest'] : ['total','goalnr','hcp','player','period','from','to','score'];
        const saved = JSON.parse(localStorage.getItem(extended ? 'poc_ext_specifiers' : 'poc_specifiers') || '[]');
        const other = store.load().markets.flatMap(m => extended ? m.extendedSpecifiers : m.specifiers);
        return [...new Set([...defaults, ...saved.map(s => s.name), ...other])].filter(Boolean);
    }
    function addSpecifier(extended, value='') {
        const row=document.createElement('div');row.className='specifier-row';
        const select=document.createElement('select'); select.className=extended?'extended-specifier-select':'specifier-select';
        select.add(new Option('Select specifier...',''));
        const options=choices(extended);if(value&&!options.includes(value))options.push(value);
        options.forEach(name=>select.add(new Option(name,name)));select.value=value;
        const remove=document.createElement('button');remove.type='button';remove.className='btn-remove';remove.textContent='X';remove.setAttribute('aria-label','Remove specifier');remove.onclick=()=>row.remove();
        row.append(select,remove);document.getElementById(extended?'extendedSpecifiersContainer':'specifiersContainer').append(row);
    }
    function addOutcome(name='',description='') {
        const row=document.createElement('div');row.className='outcome-row';row.style.cssText='display:flex;gap:12px;margin-bottom:12px;align-items:center';
        const n=document.createElement('input');n.className='outcome-name-input';n.placeholder='Outcome name (e.g. {$competitor1})';n.setAttribute('aria-label','Outcome name');n.value=name;
        const d=document.createElement('input');d.className='outcome-description-input';d.placeholder='Outcome description';d.setAttribute('aria-label','Outcome description');d.value=description;
        for(const input of [n,d])input.style.cssText='flex:1;min-width:0;padding:10px;border:1px solid #ccc;border-radius:4px';
        const remove=document.createElement('button');remove.type='button';remove.className='btn-remove';remove.textContent='X';remove.setAttribute('aria-label','Remove outcome');remove.onclick=()=>row.remove();
        row.append(n,d,remove);document.getElementById('outcomesListContainer').append(row);
    }
    function toggleOutcomes() { document.getElementById('regularOutcomesWrapper').style.display=selected('outcomesType')==='Regular'?'block':'none'; }
    try {
        original=query.get('id')?store.load().markets.find(m=>m.id===query.get('id')):null;
        if(query.get('id')&&!original)throw Error('This saved market was not found. Return to the market list.');
        document.getElementById('addSpecifierBtn').onclick=()=>addSpecifier(false);
        document.getElementById('addExtendedSpecifierBtn').onclick=()=>addSpecifier(true);
        document.getElementById('addOutcomeBtn').onclick=()=>addOutcome();
        document.querySelectorAll('input[name="outcomesType"]').forEach(r=>r.addEventListener('change',toggleOutcomes));
        if(original){
            document.getElementById('pageMainTitle').textContent='Edit Market';document.getElementById('pageSubTitle').textContent='Update market definition';document.getElementById('saveMarketBtn').textContent='Update Market';
            document.getElementById('marketName').value=original.name;document.getElementById('description').value=original.desc;document.getElementById('sport').value=original.sport.toLowerCase();
            document.querySelector(`input[name="marketType"][value="${original.type}"]`).checked=true;
            document.querySelector(`input[name="outcomesType"][value="${original.outcomesType}"]`).checked=true;
            original.specifiers.forEach(s=>addSpecifier(false,s));original.extendedSpecifiers.forEach(s=>addSpecifier(true,s));original.outcomes.forEach(o=>addOutcome(o.name,o.desc));
        }else{
            document.querySelector('input[name="marketType"][value="Regular"]').checked=true;document.querySelector('input[name="outcomesType"][value="Regular"]').checked=true;
        }
        toggleOutcomes();
        document.getElementById('saveMarketBtn').onclick=()=>{try{
            const sportSelect=document.getElementById('sport');
            const outcomesType=selected('outcomesType');
            const market=store.saveMarket({...original,name:document.getElementById('marketName').value,desc:document.getElementById('description').value,sport:sportSelect.value?sportSelect.selectedOptions[0].text:'',type:selected('marketType'),outcomesType,
                specifiers:[...document.querySelectorAll('.specifier-select')].map(n=>n.value),extendedSpecifiers:[...document.querySelectorAll('.extended-specifier-select')].map(n=>n.value),
                outcomes:outcomesType==='Regular'?[...document.querySelectorAll('.outcome-row')].map(r=>({name:r.querySelector('.outcome-name-input').value.trim(),desc:r.querySelector('.outcome-description-input').value.trim()})):[]});
            location.href='../view_hermes_market.html?id='+encodeURIComponent(market.id);
        }catch(e){error.textContent=e.message;}};
    } catch(e) { error.textContent=e.message;document.getElementById('saveMarketBtn').disabled=true; }
});
