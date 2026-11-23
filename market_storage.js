(function (root) {
    'use strict';
    const KEY = 'multifeed:market-authoring:v1';
    const demoMarkets = [
        {
            id: "demo-1x2", businessId: "HRM-001", revision: 1,
            name: "1X2", sport: "Soccer", type: "Regular",
            desc: "Home, Draw, Away match winner",
            specifiers: ["period"], extendedSpecifiers: ["score"], outcomesType: "Regular",
            outcomes: [
                { name: "{$competitor1}", desc: "Home competitor wins" },
                { name: "draw", desc: "Match ends in a draw" },
                { name: "{$competitor2}", desc: "Away competitor wins" }
            ]
        },
        {
            id: "demo-asian-handicap", businessId: "HRM-002", revision: 1,
            name: "Asian Handicap", sport: "Soccer", type: "Regular",
            desc: "Handicap betting for the match",
            specifiers: ["hcp"], extendedSpecifiers: ["score"], outcomesType: "Regular",
            outcomes: [
                { name: "{$competitor1}", desc: "Home competitor with handicap" },
                { name: "{$competitor2}", desc: "Away competitor with handicap" }
            ]
        },
        {
            id: "demo-total-goals", businessId: "HRM-003", revision: 1,
            name: "Total Goals", sport: "Soccer", type: "Statistics",
            desc: "Over/Under total goals",
            specifiers: ["total"], extendedSpecifiers: ["score", "period"], outcomesType: "Regular",
            outcomes: [
                { name: "over", desc: "Total goals over the line" },
                { name: "under", desc: "Total goals under the line" }
            ]
        },
        {
            id: "demo-anytime-goalscorer", businessId: "HRM-004", revision: 1,
            name: "Anytime goalscorer", sport: "Soccer", type: "Player Props",
            desc: "Player to score at any time",
            specifiers: ["player"], extendedSpecifiers: ["period"], outcomesType: "Regular",
            outcomes: [
                { name: "{$player}", desc: "Selected player scores at any time" }
            ]
        },
        {
            id: "demo-total-corners", businessId: "HRM-005", revision: 1,
            name: "Total Corners", sport: "Soccer", type: "Statistics",
            desc: "Over/Under total corners in the match",
            specifiers: ["total"], extendedSpecifiers: ["period"], outcomesType: "Regular",
            outcomes: [
                { name: "over", desc: "Total corners over the line" },
                { name: "under", desc: "Total corners under the line" }
            ]
        },
        {
            id: "demo-moneyline", businessId: "HRM-006", revision: 1,
            name: "Moneyline", sport: "Basketball", type: "Regular",
            desc: "Match winner without draw",
            specifiers: [], extendedSpecifiers: [], outcomesType: "Regular",
            outcomes: [
                { name: "{$competitor1}", desc: "Home competitor wins" },
                { name: "{$competitor2}", desc: "Away competitor wins" }
            ]
        },
        {
            id: "demo-set-winner", businessId: "HRM-007", revision: 1,
            name: "Set Winner", sport: "Tennis", type: "Regular",
            desc: "Winner of selected set",
            specifiers: ["set"], extendedSpecifiers: [], outcomesType: "Regular",
            outcomes: [
                { name: "{$competitor1}", desc: "First competitor wins the set" },
                { name: "{$competitor2}", desc: "Second competitor wins the set" }
            ]
        }
    ];

    const copy = value => JSON.parse(JSON.stringify(value));
    const id = () => 'local-' + (root.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(16).slice(2));
    function create(storage, providers) {
        function load() {
            const saved = storage.getItem(KEY);
            const state = saved === null ? {schema: 1, markets: [], mappings: []} : JSON.parse(saved);
            if (state.schema !== 1 || !Array.isArray(state.markets) || !Array.isArray(state.mappings)) throw Error('Saved markets could not be read. No data has been replaced.');
            const missingExamples = demoMarkets.filter(example => !state.markets.some(market =>
                market.id === example.id ||
                (market.sport === example.sport && market.name.toLowerCase() === example.name.toLowerCase())
            ));
            state.markets.push(...copy(missingExamples));
            return state;
        }
        function validateMapping(state, mapping) {
            const source = providers.find(p => p.provider === mapping.provider && p.sport === mapping.sport && p.code === mapping.sourceId);
            const target = state.markets.find(m => m.id === mapping.targetId);
            if (!source || !target) throw Error('Select an available provider market and Hermes market.');
            if (source.sport !== target.sport) throw Error('Both markets must belong to the same sport.');
            const assigned = new Set();
            for (const row of [...mapping.specifiers, ...mapping.fixedSpecifiers]) {
                if (!target.specifiers.includes(row.hermesSpecifier) || assigned.has(row.hermesSpecifier)) throw Error('Assign each Hermes specifier once.');
                assigned.add(row.hermesSpecifier);
                if ('providerSpecifier' in row && !source.specifiers.includes(row.providerSpecifier)) throw Error('Choose a documented provider attribute.');
                if ('value' in row && !String(row.value).trim()) throw Error('Enter a fixed specifier value.');
            }
            if (assigned.size !== target.specifiers.length) throw Error('Map every required Hermes specifier or give it a fixed value.');
            const extended = new Set();
            for (const row of mapping.extendedSpecifiers) {
                if (!target.extendedSpecifiers.includes(row.hermesExtendedSpecifier) || extended.has(row.hermesExtendedSpecifier)) throw Error('Assign each extended specifier once.');
                if (![...source.specifiers, ...source.extendedSpecifiers].includes(row.providerValue)) throw Error('Choose a documented provider attribute for the extended specifier.');
                extended.add(row.hermesExtendedSpecifier);
            }
            if (extended.size !== target.extendedSpecifiers.length) throw Error('Map every Hermes extended specifier.');
            if (target.outcomesType !== 'Regular') throw Error('These ExeFeed markets have explicit selections. Choose a Hermes market with regular outcomes.');
            const assignedOutcomes = new Set();
            for (const row of mapping.outcomes) {
                if (!source.outcomes.some(o => o.code === row.providerOutcome) || !target.outcomes.some(o => o.name === row.hermesOutcome) || assignedOutcomes.has(row.providerOutcome)) throw Error('Select valid provider and Hermes outcomes without repeating a provider outcome.');
                assignedOutcomes.add(row.providerOutcome);
            }
            if (assignedOutcomes.size !== source.outcomes.length) throw Error('Map every provider outcome.');
        }
        function saveMarket(input) {
            const state = load(), old = state.markets.find(m => m.id === input.id);
            if (input.id && !old) throw Error('This market no longer exists.');
            if (old && old.revision !== input.revision) throw Error('This market changed in another tab. Reload before saving.');
            const market = copy(input);
            market.name = String(market.name || '').trim(); market.desc = String(market.desc || '').trim();
            if (!market.name || !market.desc || !market.sport) throw Error('Enter a market name, description and sport.');
            if (!['Regular','Statistics','Player Props','Outright'].includes(market.type)) throw Error('Select a market type.');
            if (!['Regular','Competitors','Players'].includes(market.outcomesType)) throw Error('Select an outcomes type.');
            const all = [...market.specifiers, ...market.extendedSpecifiers];
            if (new Set(all).size !== all.length || all.some(s => !/^[A-Za-z][A-Za-z0-9_]*$/.test(s))) throw Error('Use unique specifier names containing letters, numbers or underscores.');
            if (market.outcomesType === 'Regular' && (!market.outcomes.length || market.outcomes.some(o => !o.name.trim()) || new Set(market.outcomes.map(o => o.name)).size !== market.outcomes.length)) throw Error('Enter at least one outcome and give each outcome a unique name.');
            if (state.markets.some(m => m.id !== market.id && m.sport === market.sport && m.name.toLowerCase() === market.name.toLowerCase())) throw Error('A market with this name already exists for this sport.');
            market.id = old?.id || id(); market.businessId = old?.businessId ?? null; market.revision = (old?.revision || 0) + 1;
            state.markets = state.markets.filter(m => m.id !== market.id).concat(market);
            state.mappings.filter(m => m.targetId === market.id).forEach(m => validateMapping(state, m));
            storage.setItem(KEY, JSON.stringify(state)); return market;
        }
        function saveMapping(input) {
            const state = load(), old = state.mappings.find(m => m.id === input.id);
            if (input.id && !old) throw Error('This mapping no longer exists.');
            if (old && old.revision !== input.revision) throw Error('This mapping changed in another tab. Reload before saving.');
            const mapping = copy(input); validateMapping(state, mapping);
            if (state.mappings.some(m => m.id !== mapping.id && m.provider === mapping.provider && m.sourceId === mapping.sourceId && m.sport === mapping.sport && m.targetId === mapping.targetId)) throw Error('This source is already mapped to that Hermes market. Edit the saved mapping.');
            mapping.id = old?.id || id(); mapping.revision = (old?.revision || 0) + 1;
            state.mappings = state.mappings.filter(m => m.id !== mapping.id).concat(mapping);
            storage.setItem(KEY, JSON.stringify(state)); return mapping;
        }
        function removeMapping(mappingId, revision) {
            const state = load(), mapping = state.mappings.find(m => m.id === mappingId);
            if (!mapping || mapping.revision !== revision) throw Error('The mapping changed. Reload before removing it.');
            state.mappings = state.mappings.filter(m => m.id !== mappingId); storage.setItem(KEY, JSON.stringify(state));
        }
        function providerRows() {
            const state = load();
            return providers.map(p => {
                const mappings = state.mappings.filter(m => m.provider === p.provider && m.sourceId === p.code && m.sport === p.sport);
                const targets = mappings.map(m => state.markets.find(t => t.id === m.targetId));
                return {...p, marketId: p.code, providerMarketName: p.name, status: mappings.length ? 'Mapped' : 'Unmapped', internalId: targets.map(t => t.id).join(', ') || '-', internalName: targets.map(t => t.name).join(', ') || '-'};
            });
        }
        return {load, saveMarket, saveMapping, removeMapping, providerRows, validateMapping};
    }
    const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    root.MarketStorage = {create, KEY, escape};
    if (typeof module !== 'undefined') module.exports = root.MarketStorage;
})(typeof window === 'undefined' ? globalThis : window);
