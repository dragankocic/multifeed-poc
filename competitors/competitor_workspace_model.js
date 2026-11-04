/* Browser demonstration only: no backend competitor administration is invoked. */
(function (root) {
    'use strict';
    const KEY = 'multifeed:competitor-workspace:v1';
    const clone = value => JSON.parse(JSON.stringify(value));
    const normalized = value => String(value).normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
            const seedCompetitors = [
                { id: 'CMP-001', name: 'Liverpool', sport: 'Soccer', type: 'Team', subtype: '-', members: ['CMP-101', 'CMP-102', 'CMP-103'] },
                { id: 'CMP-002', name: 'Arsenal', sport: 'Soccer', type: 'Team', subtype: '-', members: ['CMP-104', 'CMP-105'] },
                { id: 'CMP-003', name: 'Manchester City', sport: 'Soccer', type: 'Team', subtype: '-', members: ['CMP-106'] },
                { id: 'CMP-101', name: 'Mohamed Salah', sport: 'Soccer', type: 'Individual', subtype: 'Player' },
                { id: 'CMP-102', name: 'Virgil van Dijk', sport: 'Soccer', type: 'Individual', subtype: 'Player' },
                { id: 'CMP-103', name: 'Darwin Nunez', sport: 'Soccer', type: 'Individual', subtype: 'Player' },
                { id: 'CMP-104', name: 'Bukayo Saka', sport: 'Soccer', type: 'Individual', subtype: 'Player' },
                { id: 'CMP-105', name: 'Martin Odegaard', sport: 'Soccer', type: 'Individual', subtype: 'Player' },
                { id: 'CMP-106', name: 'Erling Haaland', sport: 'Soccer', type: 'Individual', subtype: 'Player' },
                { id: 'CMP-200', name: 'Red Bull Racing', sport: 'Formula 1', type: 'Team', subtype: '-' },
                { id: 'CMP-201', name: 'Max Verstappen', sport: 'Formula 1', type: 'Individual', subtype: 'Driver' },
                { id: 'CMP-202', name: 'Lewis Hamilton', sport: 'Formula 1', type: 'Individual', subtype: 'Driver' },
                { id: 'CMP-301', name: 'Novak Djokovic', sport: 'Tennis', type: 'Individual', subtype: 'Player' },
                { id: 'CMP-302', name: 'Carlos Alcaraz', sport: 'Tennis', type: 'Individual', subtype: 'Player' },
                { id: 'CMP-401', name: 'Djokovic / Alcaraz', sport: 'Tennis', type: 'Composite', subtype: 'Pair', members: ['CMP-301', 'CMP-302'] },
                { id: 'CMP-500', name: 'Ducati Lenovo Team', sport: 'Moto GP', type: 'Team', subtype: '-', members: ['CMP-501'] },
                { id: 'CMP-501', name: 'Francesco Bagnaia', sport: 'Moto GP', type: 'Individual', subtype: 'Rider' }
            ];
            const seedProviders = [
                { id: 'PC-001', provider: 'ExeFeed', providerId: '1178653', name: 'Arsenal', sport: 'Soccer', type: 'Team', subtype: '-', internalId: 'CMP-002' },
                { id: 'PC-002', provider: 'SportRadar', providerId: 'sr:competitor:17', name: 'Manchester City FC', sport: 'Soccer', type: 'Team', subtype: '-', internalId: 'CMP-003' },
                { id: 'PC-003', provider: 'ExeFeed', providerId: '1178655', name: 'Liverpool FC', sport: 'Soccer', type: 'Team', subtype: '-', internalId: 'CMP-001' },
                { id: 'PC-004', provider: 'SportRadar', providerId: 'sr:player:99090', name: 'Salah, Mohamed', sport: 'Soccer', type: 'Individual', subtype: 'Player', internalId: 'CMP-101' },
                { id: 'PC-005', provider: 'SportRadar', providerId: 'sr:player:839956', name: 'Haaland, Erling', sport: 'Soccer', type: 'Individual', subtype: 'Player', internalId: 'CMP-106' },
                { id: 'PC-010', provider: 'ExeFeed', providerId: 'f1:team:1', name: 'Red Bull Racing', sport: 'Formula 1', type: 'Team', subtype: '-', internalId: 'CMP-200' },
                { id: 'PC-006', provider: 'SportRadar', providerId: 'sr:competitor:7135', name: 'Max Verstappen', sport: 'Formula 1', type: 'Individual', subtype: 'Driver', internalId: 'CMP-201' },
                { id: 'PC-007', provider: 'ExeFeed', providerId: 'tn:player:22791', name: 'Carlos Alcaraz', sport: 'Tennis', type: 'Individual', subtype: 'Player', internalId: 'CMP-302' },
                { id: 'PC-008', provider: 'SportGenius', providerId: 'sg-pair-104', name: 'Djokovic-Alcaraz', sport: 'Tennis', type: 'Composite', subtype: 'Pair', internalId: 'CMP-401' },
                { id: 'PC-009', provider: 'SportGenius', providerId: 'sg-rider-11', name: 'F. Bagnaia', sport: 'Moto GP', type: 'Individual', subtype: 'Rider', internalId: 'CMP-501' },
                { id: 'PC-011', provider: 'ExeFeed', providerId: '2199002', name: 'Virgil van Dijk', sport: 'Soccer', type: 'Individual', subtype: 'Player', internalId: 'CMP-102' },
                { id: 'PC-012', provider: 'ExeFeed', providerId: '2199003', name: 'Darwin Nunez', sport: 'Soccer', type: 'Individual', subtype: 'Player', internalId: 'CMP-103' },
                { id: 'PC-013', provider: 'ExeFeed', providerId: '2199004', name: 'Bukayo Saka', sport: 'Soccer', type: 'Individual', subtype: 'Player', internalId: 'CMP-104' },
                { id: 'PC-014', provider: 'ExeFeed', providerId: '2199005', name: 'Martin Odegaard', sport: 'Soccer', type: 'Individual', subtype: 'Player', internalId: 'CMP-105' },
                { id: 'PC-015', provider: 'SportRadar', providerId: 'sr:competitor:52', name: 'Lewis Hamilton', sport: 'Formula 1', type: 'Individual', subtype: 'Driver', internalId: 'CMP-202' },
                { id: 'PC-016', provider: 'ExeFeed', providerId: 'tn:player:22790', name: 'Novak Djokovic', sport: 'Tennis', type: 'Individual', subtype: 'Player', internalId: 'CMP-301' },
                { id: 'PC-017', provider: 'SportRadar', providerId: 'sr:competitor:44', name: 'Liverpool', sport: 'Soccer', type: 'Team', subtype: '-', internalId: '' },
                { id: 'PC-019', provider: 'SportRadar', providerId: 'sr:competitor:demo-newcastle', name: 'Newcastle United', sport: 'Soccer', type: 'Team', subtype: '-', internalId: '' },
                { id: 'PC-018', provider: 'ExeFeed', providerId: 'mgp:team:1', name: 'Ducati Lenovo Team', sport: 'Moto GP', type: 'Team', subtype: '-', internalId: 'CMP-500' }
            ];

    function load(storage) {
        const raw = storage.getItem(KEY);
        if (!raw) return { schema: 1, revision: 0, competitors: clone(seedCompetitors), providerCompetitors: clone(seedProviders), history: [] };
        const state = JSON.parse(raw);
        if (state.schema !== 1 || !Number.isInteger(state.revision) || !Array.isArray(state.competitors) || !Array.isArray(state.providerCompetitors) || !Array.isArray(state.history)) throw new Error('Competitor data could not be read. No changes were saved.');
        return state;
    }
    function commit(storage, expectedRevision, change) {
        const state = load(storage);
        if (state.revision !== expectedRevision) throw new Error('Competitor data changed. Close this window and try again.');
        const result = change(state);
        state.revision++;
        storage.setItem(KEY, JSON.stringify(state));
        return { state, result };
    }
    function createFromProvider(state, sourceId, inputName) {
        const source = state.providerCompetitors.find(item => item.id === sourceId);
        if (!source || source.internalId) throw new Error('This provider competitor is no longer available for creation.');
        const name = String(inputName || '').trim().replace(/\s+/g, ' ');
        if (!name || name.length > 120) throw new Error('Enter a competitor name of 1–120 characters.');
        if (!source.sport || !['Team', 'Individual', 'Composite'].includes(source.type)) throw new Error('The provider competitor has incomplete sport or type data.');
        const duplicate = state.competitors.find(item => item.sport === source.sport && item.type === source.type && item.subtype === source.subtype && normalized(item.name) === normalized(name));
        if (duplicate) throw new Error('A competitor with this name, sport and type already exists. Choose Map to existing competitor.');
        const members = source.memberIds || [];
        if (source.type === 'Composite' && (members.length < 2 || members.some(id => !state.competitors.some(item => item.id === id && item.sport === source.sport && item.type === 'Individual')))) throw new Error('Map the individual members before creating this composite competitor.');
        const number = Math.max(0, ...state.competitors.map(item => Number(item.id.replace('CMP-', '')) || 0)) + 1;
        const competitor = { id: 'CMP-' + String(number).padStart(3, '0'), name, sport: source.sport, type: source.type, subtype: source.subtype, members: clone(members), createdFrom: { provider: source.provider, providerId: source.providerId } };
        state.competitors.push(competitor);
        source.internalId = competitor.id;
        state.history.push({ action: 'Create competitor and mapping', competitorId: competitor.id, provider: source.provider, providerId: source.providerId, at: new Date().toISOString() });
        return competitor.id;
    }
    root.CompetitorWorkspace = { KEY, load, commit, createFromProvider };
})(typeof window === 'undefined' ? globalThis : window);
