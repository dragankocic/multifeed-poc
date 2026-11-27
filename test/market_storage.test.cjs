const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {create,KEY}=require('../market_storage.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/../exefeed_markets.js','utf8'),context);
const sources=JSON.parse(JSON.stringify(context.window.ExeFeedMarkets));
function setup(){const values=new Map();const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};return {store:create(storage,sources),storage,values};}
function market(store,name='My total',sport='Soccer'){return store.saveMarket({name,desc:'Goals over or under a line',sport,type:'Regular',specifiers:['total'],extendedSpecifiers:[],outcomesType:'Regular',outcomes:[{name:'over {total}',desc:'Over'},{name:'under {total}',desc:'Under'}]});}
function mapping(target,sourceId='TOTAL_GOALS'){return {provider:'ExeFeed',sport:'Soccer',sourceId,targetId:target.id,specifiers:[{providerSpecifier:'B',hermesSpecifier:'total'}],fixedSpecifiers:[],extendedSpecifiers:[],outcomes:[{providerOutcome:'OVER',hermesOutcome:'over {total}'},{providerOutcome:'UNDER',hermesOutcome:'under {total}'}]};}
test('the initial Hermes catalogue restores examples across sports while ExeFeed starts unmapped', () => {
    const {store, values} = setup();
    const {markets, mappings} = store.load();
    assert.deepEqual(markets.map(m => m.name), [
        '1X2', 'Asian Handicap', 'Total Goals', 'Anytime goalscorer', 'Total Corners', 'Moneyline', 'Set Winner'
    ]);
    assert.equal(markets.find(m => m.name === 'Moneyline').sport, 'Basketball');
    assert.equal(markets.find(m => m.name === 'Set Winner').sport, 'Tennis');
    assert.deepEqual(mappings, []);
    assert.equal(sources.length, 33);
    assert.ok(store.providerRows().every(row => row.provider === 'ExeFeed' && row.status === 'Unmapped'));
    assert.ok(sources.find(source => source.code === 'HOME_WIN_3+'));
    assert.equal(values.size, 0);
});

test('existing markets and mappings survive restoration, including a custom market with an example name', () => {
    const {store, values} = setup();
    const custom = {
        id: 'local-total', revision: 2, businessId: null, name: 'total goals', sport: 'Soccer',
        desc: 'Custom goals definition', type: 'Regular', outcomesType: 'Regular',
        specifiers: ['total'], extendedSpecifiers: [],
        outcomes: [{name: 'over {total}', desc: 'Over'}, {name: 'under {total}', desc: 'Under'}]
    };
    const savedMapping = {...mapping(custom), id: 'local-mapping', revision: 1};
    const before = JSON.stringify({schema: 1, markets: [custom], mappings: [savedMapping]});
    values.set(KEY, before);

    const restored = store.load();
    assert.deepEqual(restored.markets.filter(m => m.name.toLowerCase() === 'total goals'), [custom]);
    assert.ok(restored.markets.some(m => m.name === '1X2'));
    assert.deepEqual(restored.mappings, [savedMapping]);
    assert.equal(values.get(KEY), before);
    assert.equal(store.providerRows().find(row => row.code === 'TOTAL_GOALS').internalId, custom.id);
});

test('a restored 1X2 market can be edited and used in a persistent ExeFeed mapping', () => {
    const {store, storage} = setup();
    const example = store.load().markets.find(m => m.name === '1X2');
    const edited = store.saveMarket({...example, desc: 'Fixture result for the selected period'});
    store.saveMapping({
        provider: 'ExeFeed', sport: 'Soccer', sourceId: 'REST_OF_THE_MATCH', targetId: edited.id,
        specifiers: [], fixedSpecifiers: [{hermesSpecifier: 'period', value: 'full_time'}],
        extendedSpecifiers: [{hermesExtendedSpecifier: 'score', providerValue: 'R'}],
        outcomes: [
            {providerOutcome: '1', hermesOutcome: '{$competitor1}'},
            {providerOutcome: 'X', hermesOutcome: 'draw'},
            {providerOutcome: '2', hermesOutcome: '{$competitor2}'}
        ]
    });

    const reopened = create(storage, sources);
    assert.deepEqual(reopened.load().markets.filter(m => m.id === example.id), [edited]);
    assert.equal(reopened.providerRows().find(row => row.code === 'REST_OF_THE_MATCH').internalName, '1X2');
});
test('custom definitions and mapped provider attributes survive reload without assigning business IDs',()=>{const {store,storage}=setup();const target=market(store);store.saveMapping(mapping(target));const reopened=create(storage,sources);assert.equal(reopened.load().markets.find(m=>m.id===target.id).businessId,null);assert.deepEqual(reopened.load().markets.find(m=>m.id===target.id).specifiers,['total']);assert.equal(reopened.load().mappings[0].specifiers[0].providerSpecifier,'B');assert.equal(reopened.providerRows().find(p=>p.code==='TOTAL_GOALS').status,'Mapped');});
test('several single-selection ExeFeed markets map to one custom market using fixed totals',()=>{const {store}=setup(),target=market(store);for(const [code,total] of [['HOME_WIN_3+','2.5'],['HOME_WIN_4+','3.5']])store.saveMapping({provider:'ExeFeed',sport:'Soccer',sourceId:code,targetId:target.id,specifiers:[],fixedSpecifiers:[{value:total,hermesSpecifier:'total'}],extendedSpecifiers:[],outcomes:[{providerOutcome:code,hermesOutcome:'over {total}'}]});assert.deepEqual(store.load().mappings.map(m=>m.fixedSpecifiers[0].value),['2.5','3.5']);assert.equal(store.load().markets.filter(m=>m.id===target.id).length,1);});
test('incomplete and conflicting mappings do not persist',()=>{const {store}=setup(),target=market(store),m=mapping(target);assert.throws(()=>store.saveMapping({...m,outcomes:[]}),/Map every provider outcome/);assert.throws(()=>store.saveMapping({...m,fixedSpecifiers:[{value:'2.5',hermesSpecifier:'total'}]}),/once/);assert.throws(()=>store.saveMapping({...m,specifiers:[]}),/every required/);assert.equal(store.load().mappings.length,0);});
test('editing, stale saves and removal preserve mapping integrity',()=>{const {store}=setup(),target=market(store);const saved=store.saveMapping(mapping(target));const updated=store.saveMapping({...saved,specifiers:[],fixedSpecifiers:[{value:'2.5',hermesSpecifier:'total'}]});assert.throws(()=>store.saveMapping(saved),/another tab/);assert.throws(()=>store.saveMarket({...target,specifiers:[]}),/once/);store.removeMapping(updated.id,updated.revision);assert.equal(store.load().mappings.length,0);assert.equal(store.providerRows().find(p=>p.code==='TOTAL_GOALS').status,'Unmapped');});
test('cross-sport mappings and duplicate source-target mappings are rejected',()=>{const {store}=setup(),target=market(store);store.saveMapping(mapping(target));assert.throws(()=>store.saveMapping(mapping(target)),/already mapped/);const basketball=market(store,'Other total','Basketball');assert.throws(()=>store.saveMapping(mapping(basketball)),/same sport/);});
test('unreadable or full storage is reported instead of replaced or silently ignored',()=>{const values=new Map([[KEY,'broken']]);const broken=create({getItem:k=>values.get(k),setItem:()=>assert.fail('Must not replace corrupted data')},sources);assert.throws(()=>broken.load());const full=create({getItem:()=>null,setItem:()=>{throw Error('Storage full');}},sources);assert.throws(()=>market(full),/Storage full/);});

test('the shared catalogue imports both legacy lists and persists additions and deletions', () => {
    const {store, storage, values} = setup();
    values.set('poc_specifiers', JSON.stringify([{id: 1, name: 'legacy_regular'}]));
    values.set('poc_ext_specifiers', JSON.stringify([
        {id: 1, name: 'legacy_extended'}, {id: 2, name: 'legacy_regular'}
    ]));

    assert.ok(store.listSpecifiers().includes('legacy_extended'));
    assert.equal(store.listSpecifiers().filter(name => name === 'legacy_regular').length, 1);
    assert.throws(() => store.saveSpecifier('legacy_regular'), /already exists/);
    store.saveSpecifier('new_specifier');
    store.removeSpecifier('legacy_regular');
    store.removeSpecifier('goalnr');

    const reopened = create(storage, sources);
    const names = reopened.listSpecifiers();
    assert.ok(names.includes('legacy_extended'));
    assert.ok(names.includes('new_specifier'));
    assert.ok(names.includes('set'));
    assert.ok(!names.includes('legacy_regular'));
    assert.ok(!names.includes('goalnr'));
});

test('renaming updates both market roles and their mappings together', () => {
    const {store, storage} = setup();
    const regular = market(store);
    const extended = store.saveMarket({
        ...regular, id: undefined, name: 'Extended total', specifiers: [], extendedSpecifiers: ['total']
    });
    store.saveMapping(mapping(regular));
    store.saveMapping({
        ...mapping(regular, 'TOTAL_GOALS_1ST_HALF'),
        specifiers: [], fixedSpecifiers: [{hermesSpecifier: 'total', value: '2.5'}]
    });
    store.saveMapping({
        ...mapping(extended), specifiers: [],
        extendedSpecifiers: [{hermesExtendedSpecifier: 'total', providerValue: 'B'}]
    });
    assert.throws(() => store.removeSpecifier('total'), /Remove this specifier from all markets/);
    assert.throws(() => store.saveSpecifier('period', 'total'), /already exists/);
    store.saveSpecifier('goal_line', 'total');

    const reopened = create(storage, sources);
    const {markets, mappings} = reopened.load();
    assert.ok(!reopened.listSpecifiers().includes('total'));
    assert.deepEqual(markets.find(m => m.id === regular.id).specifiers, ['goal_line']);
    assert.deepEqual(markets.find(m => m.id === extended.id).extendedSpecifiers, ['goal_line']);
    assert.equal(mappings[0].specifiers[0].hermesSpecifier, 'goal_line');
    assert.equal(mappings[1].fixedSpecifiers[0].hermesSpecifier, 'goal_line');
    assert.equal(mappings[2].extendedSpecifiers[0].hermesExtendedSpecifier, 'goal_line');
    assert.equal(mappings[2].extendedSpecifiers[0].providerValue, 'B');
    assert.equal(mappings[2].outcomes[0].hermesOutcome, 'over {goal_line}');
    for (const saved of mappings) {
        assert.equal(saved.revision, 2);
        reopened.validateMapping({markets}, saved);
    }
    assert.throws(() => reopened.saveMarket(regular), /another tab/);
});

test('specifier data types apply their regex and canonicalize fixed mapping values without rounding', () => {
    const {store, storage} = setup();
    const examples = [
        ['INTEGER', '0009007199254740993', '9007199254740993', '1.0'],
        ['DECIMAL', '-0002.5000', '-2.5', '2e1'],
        ['DECIMAL', '-00.000', '0', '.5'],
        ['SCORE', '01:02', '1:2', '-1:2'],
        ['STRING', ' Home ', ' Home ', '']
    ];
    for (const [index, [dataType, input, canonical, invalid]] of examples.entries()) {
        const name = 'typed_' + index;
        store.saveSpecifier(name, null, dataType);
        const target = store.saveMarket({
            ...market(store, 'Example ' + index), specifiers: [name]
        });
        const fixed = value => ({...mapping(target), specifiers: [], fixedSpecifiers: [{hermesSpecifier: name, value}]});
        assert.throws(() => store.saveMapping(fixed(invalid)), new RegExp(`valid ${dataType} value for ${name}`));
        assert.equal(store.saveMapping(fixed(input)).fixedSpecifiers[0].value, canonical);
    }
    const reopened = create(storage, sources);
    assert.deepEqual(reopened.load().mappings.map(saved => saved.fixedSpecifiers[0].value), examples.map(example => example[2]));
    assert.throws(() => store.saveSpecifier('invalid_type', null, 'BOOLEAN'), /valid specifier data type/);
});

test('legacy specifiers get types and a type change validates existing fixed values before saving', () => {
    const {store, storage, values} = setup();
    values.set('poc_specifiers', JSON.stringify([{name: 'custom'}]));
    const types = Object.fromEntries(store.listSpecifierDefinitions().map(({name, dataType}) => [name, dataType]));
    assert.equal(types.total, 'DECIMAL');
    assert.equal(types.set, 'INTEGER');
    assert.equal(types.score, 'SCORE');
    assert.equal(types.custom, 'STRING');

    const target = store.saveMarket({...market(store), specifiers: ['custom']});
    const saved = store.saveMapping({
        ...mapping(target), specifiers: [], fixedSpecifiers: [{hermesSpecifier: 'custom', value: '003'}]
    });
    const before = values.get(KEY);
    assert.throws(() => store.saveSpecifier('renamed', 'custom', 'SCORE'), /Update the fixed value in the TOTAL_GOALS mapping/);
    assert.equal(values.get(KEY), before);

    store.saveSpecifier('renamed', 'custom', 'INTEGER');
    const reopened = create(storage, sources);
    assert.deepEqual(reopened.listSpecifierDefinitions().find(specifier => specifier.name === 'renamed'), {
        name: 'renamed', dataType: 'INTEGER'
    });
    const [updated] = reopened.load().mappings;
    assert.deepEqual(updated.fixedSpecifiers, [{hermesSpecifier: 'renamed', value: '3'}]);
    assert.equal(updated.revision, saved.revision + 1);
    assert.throws(() => reopened.saveMapping(saved), /another tab/);
});
