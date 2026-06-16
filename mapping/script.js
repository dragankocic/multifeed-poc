// DOM Elements
const addMappingBtn = document.getElementById('addMappingBtn');
const dynamicSections = document.getElementById('dynamicSections');
const providerMarketSelect = document.getElementById('providerMarketSelect');

// Modal Elements
const viewMarketBtn = document.getElementById('viewMarketBtn');
const jsonModal = document.getElementById('jsonModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const jsonContent = document.getElementById('jsonContent');

// State
let mappingCounter = 0;
let currentProviderOutcomes = [];

// Mock podaci koji simuliraju bazu provajdera
const providerMarketsData = {
    "1X2": { type: "Regular", specifiers: [], outcomes: ["1", "X", "2"] },
    "TOTAL_GOALS": { type: "Regular", specifiers: ["band"], outcomes: ["Over", "Under"] },
    "TOTAL_GOALS_15_MIN": { type: "Regular", specifiers: ["band"], outcomes: ["OVER", "UNDER"] },
    "TOTAL_GOALS_20_MIN": { type: "Regular", specifiers: ["band"], outcomes: ["OVER", "UNDER"] },
    "ANY_GOAL_SCORER": { type: "Player props", specifiers: [], outcomes: [] },
    "ANYTIME_GOALSCORER": { type: "Player props", specifiers: [], outcomes: [] },
    "NEXT_GOAL_SCORER": { type: "Player props", specifiers: ["B", "R"], outcomes: [] }
};

// Rečnik za automatsko povlačenje Hermes Market Type-a
const hermesMarketTypes = {
    "1X2": "Regular",
    "Asian Handicap": "Regular",
    "Total Goals": "Regular",
    "Total Goals flat": "Regular",
    "5 minutes - total from {from} to {to}": "Regular",
    "Anytime goalscorer": "Player props",
    "{!goalnr} goalscorer": "Player props"
};

// --- LOGIKA ZA MODAL (View Market JSON) ---
viewMarketBtn.addEventListener('click', () => {
    const selectedMarketName = providerMarketSelect.value;
    const marketData = providerMarketsData[selectedMarketName];
    jsonContent.textContent = JSON.stringify(marketData, null, 4);
    jsonModal.style.display = "flex";
});

closeModalBtn.addEventListener('click', () => {
    jsonModal.style.display = "none";
});

window.addEventListener('click', (event) => {
    if (event.target === jsonModal) {
        jsonModal.style.display = "none";
    }
});


// Logika prilikom izbora Provider Marketa
providerMarketSelect.addEventListener('change', function() {
    const selectedMarketName = this.value;
    const marketData = providerMarketsData[selectedMarketName];
    
    addMappingBtn.disabled = false;
    addMappingBtn.style.opacity = "1";
    addMappingBtn.style.cursor = "pointer";
    
    viewMarketBtn.disabled = false;
    viewMarketBtn.style.opacity = "1";
    viewMarketBtn.style.cursor = "pointer";

    currentProviderOutcomes = marketData.outcomes;

    dynamicSections.innerHTML = '';
    mappingCounter = 0;
});


// IZMENJENO: Prima listu provider specifiera i generiše selekt umesto tekstualnog polja
function createSpecifierRowHtml(providerSpecifiers = []) {
    const hermesSpecifiers = ["goalnr", "hcp", "total", "from", "to"];
    const hermesOptionsHtml = hermesSpecifiers.map(spec => `<option value="${spec}">${spec}</option>`).join('');

    let providerOptionsHtml = '';
    if (providerSpecifiers.length > 0) {
        providerOptionsHtml = providerSpecifiers.map(spec => `<option value="${spec}">${spec}</option>`).join('');
    } else {
        providerOptionsHtml = `<option value="" disabled>No specifiers available</option>`;
    }

    return `
        <div style="display: flex; gap: 20px; flex: 1; align-items: flex-end;">
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>Provider market specifier</label>
                <select>
                    <option value="" disabled selected>Select provider specifier...</option>
                    ${providerOptionsHtml}
                </select>
            </div>
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>Hermes specifier</label>
                <select>
                    <option value="" disabled selected>Select specifier...</option>
                    ${hermesOptionsHtml}
                </select>
            </div>
        </div>
        <button type="button" class="btn-remove btn-remove-specifier" style="margin-bottom: 10px; margin-left: 10px;" title="Remove">X</button>
    `;
}

// NOVO: Funkcija za Fixed Specifiers (levo tekstualno polje, desno dropdown)
function createFixedSpecifierRowHtml() {
    const hermesSpecifiers = ["goalnr", "hcp", "total", "from", "to"];
    const hermesOptionsHtml = hermesSpecifiers.map(spec => `<option value="${spec}">${spec}</option>`).join('');

    return `
        <div style="display: flex; gap: 20px; flex: 1; align-items: flex-end;">
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>Provider fixed specifier</label>
                <input type="text" placeholder="e.g. fiksna vrednost...">
            </div>
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>Hermes specifier</label>
                <select>
                    <option value="" disabled selected>Select specifier...</option>
                    ${hermesOptionsHtml}
                </select>
            </div>
        </div>
        <button type="button" class="btn-remove btn-remove-fixed-specifier" style="margin-bottom: 10px; margin-left: 10px;" title="Remove">X</button>
    `;
}

// Provider select (levo), Hermes select (desno)
function createExtSpecifierRowHtml() {
    const extSpecifiers = ["match_status", "score_info", "set_number", "score"];
    const optionsHtml = extSpecifiers.map(ext => `<option value="${ext}">${ext}</option>`).join('');

    return `
        <div style="display: flex; gap: 20px; flex: 1; align-items: flex-end;">
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>Provider value</label>
                <input type="text" placeholder="Provider value or variable...">
            </div>
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>Hermes extended specifier</label>
                <select>
                    <option value="" disabled selected>Select extended specifier...</option>
                    ${optionsHtml}
                </select>
            </div>
        </div>
        <button type="button" class="btn-remove btn-remove-ext-specifier" style="margin-bottom: 10px; margin-left: 10px;" title="Remove">X</button>
    `;
}

// Provider select (levo), Hermes select (desno)
function createOutcomeRowHtml() {
    const providerOptionsHtml = currentProviderOutcomes.map(o => `<option value="${o}">${o}</option>`).join('');
    
    return `
        <div style="display: flex; gap: 20px; flex: 1; align-items: flex-end;">
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>Provider outcome</label>
                <select>
                    <option value="" disabled selected>Select provider outcome...</option>
                    ${providerOptionsHtml}
                </select>
            </div>
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>Hermes outcome</label>
                <select>
                    <option value="" disabled selected>Select Hermes outcome...</option>
                    <option value="{$competitor1}">{$competitor1}</option>
                    <option value="draw">draw</option>
                    <option value="{$competitor2}">{$competitor2}</option>
                    <option value="home">home</option>
                    <option value="away">away</option>
                    <option value="Over">Over</option>
                    <option value="Under">Under</option>
                    <option value="0-2">0-2</option>
                    <option value="3+">3+</option>
                    <option value="1">1</option>
                    <option value="X">X</option>
                    <option value="2">2</option>
                </select>
            </div>
        </div>
        <button type="button" class="btn-remove btn-remove-outcome" style="margin-bottom: 10px; margin-left: 10px;" title="Remove">X</button>
    `;
}

// Event listener za dodavanje nove kartice mapiranja
addMappingBtn.addEventListener('click', function() {
    mappingCounter++;
    const currentMappingId = mappingCounter; 
    
    const selectedProviderMarketName = providerMarketSelect.value;
    const marketData = providerMarketsData[selectedProviderMarketName];
    const isPlayerProps = marketData.type === "Player props";
    
    // Čitanje trenutnih specifiera sa marketa provajdera
    const currentProviderSpecifiers = marketData.specifiers || [];
    
    // Sakrivamo Outcome sekciju za Player props
    const sectionDisplayStyle = isPlayerProps ? "none" : "block";

    const newSection = document.createElement('div');
    newSection.classList.add('mapping-card');
    newSection.style.backgroundColor = "white"; 
    
    newSection.innerHTML = `
        <div class="mapping-card-header">
            <h4>Mapping #${currentMappingId}</h4>
        </div>
        
        <div class="form-row">
            <div class="form-group" style="flex: 2;">
                <label>Choose Hermes Market</label>
                <select class="hermes-market-select">
                    <option value="" disabled selected>Select a market...</option>
                    <option value="1X2">1X2</option>
                    <option value="Asian Handicap">Asian Handicap</option>
                    <option value="Total Goals">Total Goals</option>
                    <option value="Total Goals flat">Total Goals flat</option>
                    <option value="5 minutes - total from {from} to {to}">5 minutes - total from {from} to {to}</option>
                    <option value="Anytime goalscorer">Anytime goalscorer</option>
                    <option value="{!goalnr} goalscorer">{!goalnr} goalscorer</option>
                </select>
            </div>
            <div class="form-group" style="flex: 1;">
                <label>Market Type</label>
                <input type="text" class="hermes-market-type-display" readonly placeholder="Type..." style="background-color: #f9f9f9; color: #555;">
            </div>
        </div>

        <div class="mapping-details-wrapper" style="display: none;">
            
            <div class="specifier-mapping-section" style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h5 style="margin: 0; color: #555; font-size: 15px;">Specifiers mapping</h5>
                    <button type="button" class="btn-secondary btn-add-specifier">Add Specifier</button>
                </div>
                <div class="specifiers-list">
                    <div class="specifier-row">${createSpecifierRowHtml(currentProviderSpecifiers)}</div>
                </div>
            </div>

            <div class="fixed-specifier-mapping-section" style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h5 style="margin: 0; color: #555; font-size: 15px;">Fixed specifiers mapping</h5>
                    <button type="button" class="btn-secondary btn-add-fixed-specifier">Add Fixed Specifier</button>
                </div>
                <div class="fixed-specifiers-list">
                    <div class="specifier-row">${createFixedSpecifierRowHtml()}</div>
                </div>
            </div>

            <div class="ext-specifier-mapping-section" style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h5 style="margin: 0; color: #555; font-size: 15px;">Extended specifiers mapping</h5>
                    <button type="button" class="btn-secondary btn-add-ext-specifier">Add Ext. Specifier</button>
                </div>
                <div class="ext-specifiers-list"></div>
            </div>
            
            <div class="outcome-mapping-section" style="display: ${sectionDisplayStyle}; margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h5 style="margin: 0; color: #555; font-size: 15px;">Outcome mapping</h5>
                    <button type="button" class="btn-secondary btn-add-outcome">Add Outcome</button>
                </div>
                <div class="outcomes-list">
                    <div class="outcome-row">${createOutcomeRowHtml()}</div>
                </div>
            </div>

            <div style="text-align: right; margin-top: 25px; border-top: 1px solid #eee; padding-top: 15px;">
                <button type="button" class="btn-primary btn-save-single-mapping">Save mapping</button>
            </div>

        </div>
    `;
    
    const selectMarket = newSection.querySelector('.hermes-market-select');
    const marketTypeDisplay = newSection.querySelector('.hermes-market-type-display');
    const mappingDetailsWrapper = newSection.querySelector('.mapping-details-wrapper');
    
    const addSpecifierBtn = newSection.querySelector('.btn-add-specifier');
    const specifiersList = newSection.querySelector('.specifiers-list');
    
    // Elementi za Fixed Specifiers
    const addFixedSpecifierBtn = newSection.querySelector('.btn-add-fixed-specifier');
    const fixedSpecifiersList = newSection.querySelector('.fixed-specifiers-list');

    const addExtSpecifierBtn = newSection.querySelector('.btn-add-ext-specifier');
    const extSpecifiersList = newSection.querySelector('.ext-specifiers-list');
    
    const addOutcomeBtn = newSection.querySelector('.btn-add-outcome');
    const outcomesList = newSection.querySelector('.outcomes-list');
    const saveSingleMappingBtn = newSection.querySelector('.btn-save-single-mapping');

    // Kada se izabere Hermes Market, upiši njegov tip i prikaži ostatak forme
    selectMarket.addEventListener('change', function() {
        if(this.value) {
            marketTypeDisplay.value = hermesMarketTypes[this.value] || "Unknown";
            mappingDetailsWrapper.style.display = 'block';
        }
    });

    // --- LOGIKA ZA DODAVANJE REDOVA ---
    
    // 1. Specifiers
    addSpecifierBtn.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.classList.add('specifier-row');
        newRow.innerHTML = createSpecifierRowHtml(currentProviderSpecifiers);
        newRow.querySelector('.btn-remove-specifier').addEventListener('click', () => newRow.remove());
        specifiersList.appendChild(newRow);
    });

    const initialRemoveSpecifierBtn = newSection.querySelector('.btn-remove-specifier');
    if (initialRemoveSpecifierBtn) {
        initialRemoveSpecifierBtn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    }

    // 2. NOVO: Fixed Specifiers
    addFixedSpecifierBtn.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.classList.add('specifier-row'); // Koristimo istu CSS klasu za raspored
        newRow.innerHTML = createFixedSpecifierRowHtml();
        newRow.querySelector('.btn-remove-fixed-specifier').addEventListener('click', () => newRow.remove());
        fixedSpecifiersList.appendChild(newRow);
    });

    const initialRemoveFixedSpecifierBtn = newSection.querySelector('.btn-remove-fixed-specifier');
    if (initialRemoveFixedSpecifierBtn) {
        initialRemoveFixedSpecifierBtn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    }

    // 3. Extended Specifiers
    addExtSpecifierBtn.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.classList.add('ext-specifier-row');
        newRow.innerHTML = createExtSpecifierRowHtml();
        newRow.querySelector('.btn-remove-ext-specifier').addEventListener('click', () => newRow.remove());
        extSpecifiersList.appendChild(newRow);
    });

    // 4. Outcomes
    addOutcomeBtn.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.classList.add('outcome-row');
        newRow.innerHTML = createOutcomeRowHtml();
        newRow.querySelector('.btn-remove-outcome').addEventListener('click', () => newRow.remove());
        outcomesList.appendChild(newRow);
    });

    const initialRemoveOutcomeBtn = newSection.querySelector('.btn-remove-outcome');
    if (initialRemoveOutcomeBtn) {
        initialRemoveOutcomeBtn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    }

    // --- LOGIKA ZA ČUVANJE (SAVE) ---
    saveSingleMappingBtn.addEventListener('click', () => {
        const selectedMarket = selectMarket.value;
        alert(`Mapping #${currentMappingId} for Hermes Market "${selectedMarket}" has been saved!`);
    });

    dynamicSections.appendChild(newSection);
});

// --- AUTO-POPULATE IZ URL-a ---
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlMarket = urlParams.get('market');
    const urlSport = urlParams.get('sport');

    // 1. Prikazujemo sport ako je prosleđen
    if (urlSport) {
        const sportDisplay = document.getElementById('displaySport');
        if (sportDisplay) sportDisplay.textContent = urlSport;
    }

    // 2. Selektujemo market ako je prosleđen
    if (urlMarket) {
        // Provera da li taj market postoji u našim mock podacima. Ako ne, kreiramo ga da JS ne bi pukao.
        if (!providerMarketsData[urlMarket]) {
            providerMarketsData[urlMarket] = { 
                type: "Regular", 
                specifiers: [], 
                outcomes: ["Home", "Away"] // Generički ishodi za nepoznate markete
            };
        }

        // Provera da li opcija postoji u HTML dropdown-u. Ako ne, dodajemo je.
        const optionExists = Array.from(providerMarketSelect.options).some(opt => opt.value === urlMarket);
        if (!optionExists) {
            const newOption = document.createElement('option');
            newOption.value = urlMarket;
            newOption.textContent = urlMarket;
            providerMarketSelect.appendChild(newOption);
        }

        // Postavljamo vrednost dropdown-a i trigerujemo 'change' event da otključamo dugmiće
        providerMarketSelect.value = urlMarket;
        providerMarketSelect.dispatchEvent(new Event('change'));
    }
});