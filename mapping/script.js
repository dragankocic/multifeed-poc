// DOM Elements
const addMappingBtn = document.getElementById('addMappingBtn');
const dynamicSections = document.getElementById('dynamicSections');
const providerMarketSelect = document.getElementById('providerMarketSelect');

// Modal Elements
const viewMarketBtn = document.getElementById('viewMarketBtn');
const jsonModal = document.getElementById('jsonModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const jsonContent = document.getElementById('jsonContent');
const jsonModalTitle = document.getElementById('jsonModalTitle');

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
    jsonModalTitle.textContent = "Provider Market Data";
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
    loadProviderMarket(this.value);
});

// Specifier iz providera (dropdown) levo, Hermes desno
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

// Rečnik za ishode specifične za svaki market
const marketOutcomes = {
    "1X2": ["home", "draw", "away"],
    "Asian Handicap": ["home", "away"],
    "Total Goals": ["Over", "Under"],
    "Total Goals flat": ["Over", "Under"],
    "5 minutes - total from {from} to {to}": ["Over", "Under"],
    "Anytime goalscorer": ["Yes", "No"],
    "{!goalnr} goalscorer": ["Yes", "No"]
};

// Fixed Specifier levo, Hermes desno
function createFixedSpecifierRowHtml() {
    const hermesSpecifiers = ["goalnr", "hcp", "total", "from", "to"];
    const hermesOptionsHtml = hermesSpecifiers.map(spec => `<option value="${spec}">${spec}</option>`).join('');

    return `
        <div style="display: flex; gap: 20px; flex: 1; align-items: flex-end;">
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>Fixed Specifier Value</label>
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

// Provider levo, Hermes desno
function createExtSpecifierRowHtml() {
    const extSpecifiers = ["match_status", "score_info", "set_number", "score"];
    const optionsHtml = extSpecifiers.map(ext => `<option value="${ext}">${ext}</option>`).join('');
    
    // Promena Provider value u dropdown
    const providerValues = ["live", "prematch", "1st_half", "2nd_half", "ot", "set1", "set2", "set3", "any"];
    const providerOptionsHtml = providerValues.map(val => `<option value="${val}">${val}</option>`).join('');

    return `
        <div style="display: flex; gap: 20px; flex: 1; align-items: flex-end;">
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>Provider value</label>
                <select>
                    <option value="" disabled selected>Select provider value...</option>
                    ${providerOptionsHtml}
                </select>
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

// Provider select (levo), Hermes select (desno) - specifični ishodi po marketu
function createOutcomeRowHtml(selectedHermesMarket = "1X2") {
    const providerOptionsHtml = currentProviderOutcomes.map(o => `<option value="${o}">${o}</option>`).join('');
    const outcomesListForMarket = marketOutcomes[selectedHermesMarket] || ["home", "draw", "away"];
    const hermesOptionsHtml = outcomesListForMarket.map(o => `<option value="${o}">${o}</option>`).join('');
    
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
                <select class="hermes-outcome-select">
                    <option value="" disabled selected>Select Hermes outcome...</option>
                    ${hermesOptionsHtml}
                </select>
            </div>
        </div>
        <button type="button" class="btn-remove btn-remove-outcome" style="margin-bottom: 10px; margin-left: 10px;" title="Remove">X</button>
    `;
}

// Funkcija za dinamičko osvežavanje Hermes outcome dropdown-a kada se promeni Hermes market
function updateOutcomeDropdowns(container, hermesMarket) {
    const dropdowns = container.querySelectorAll('.hermes-outcome-select');
    const outcomesListForMarket = marketOutcomes[hermesMarket] || ["home", "draw", "away"];
    const hermesOptionsHtml = `<option value="" disabled selected>Select Hermes outcome...</option>` + 
        outcomesListForMarket.map(o => `<option value="${o}">${o}</option>`).join('');
    
    dropdowns.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = hermesOptionsHtml;
        if (outcomesListForMarket.includes(currentValue)) {
            select.value = currentValue;
        }
    });
}

function selectedValue(row, selector) {
    const field = row.querySelector(selector);
    return field ? field.value || null : null;
}

function selectedByIndex(row, selector, index) {
    const field = row.querySelectorAll(selector)[index];
    return field ? field.value || null : null;
}

function buildMappingDefinition(section, mappingId, selectedProviderMarketName) {
    const hermesMarket = selectedValue(section, '.hermes-market-select') || 'Total Goals';
    const providerMarket = selectedProviderMarketName || 'TOTAL_GOALS';
    const marketType = selectedValue(section, '.hermes-market-type-display') || hermesMarketTypes[hermesMarket] || 'Regular';

    const specifiers = Array.from(section.querySelectorAll('.specifiers-list .specifier-row')).map(row => ({
        providerSpecifier: selectedByIndex(row, 'select', 0) || 'band',
        hermesSpecifier: selectedByIndex(row, 'select', 1) || 'total'
    }));

    const fixedSpecifiers = Array.from(section.querySelectorAll('.fixed-specifiers-list .specifier-row')).map(row => ({
        value: selectedValue(row, 'input') || 'full_match',
        hermesSpecifier: selectedValue(row, 'select') || 'period'
    }));

    const extendedSpecifiers = Array.from(section.querySelectorAll('.ext-specifiers-list .ext-specifier-row')).map(row => ({
        providerValue: selectedByIndex(row, 'select', 0) || 'live',
        hermesExtendedSpecifier: selectedByIndex(row, 'select', 1) || 'match_status'
    }));

    const outcomes = Array.from(section.querySelectorAll('.outcomes-list .outcome-row')).map(row => ({
        providerOutcome: selectedValue(row, 'select') || 'Over',
        hermesOutcome: selectedValue(row, '.hermes-outcome-select') || 'Over'
    }));

    return {
        mappingId: `draft-${mappingId}`,
        provider: document.getElementById('displayProvider')?.textContent || 'ExeFeed',
        sport: document.getElementById('displaySport')?.textContent || 'Soccer',
        providerMarket,
        hermesMarket,
        marketType,
        specifiers,
        fixedSpecifiers,
        extendedSpecifiers,
        outcomes,
        publishStatus: 'draft'
    };
}

function enableMarketActions() {
    addMappingBtn.disabled = false;
    addMappingBtn.style.opacity = "1";
    addMappingBtn.style.cursor = "pointer";

    viewMarketBtn.disabled = false;
    viewMarketBtn.style.opacity = "1";
    viewMarketBtn.style.cursor = "pointer";
}

function loadProviderMarket(selectedMarketName) {
    if (!selectedMarketName) return;

    if (!providerMarketsData[selectedMarketName]) {
        providerMarketsData[selectedMarketName] = {
            type: "Regular",
            specifiers: [],
            outcomes: ["Home", "Away"]
        };
    }

    const marketData = providerMarketsData[selectedMarketName];

    enableMarketActions();
    currentProviderOutcomes = marketData.outcomes;
    dynamicSections.innerHTML = '';
    mappingCounter = 0;
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
    
    // IZMENA: Grupisanje Specifiera u zajednički blok
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
            
            <div class="specifiers-group-section" style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc;">
                <h4 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px;">Specifiers Mapping</h4>
                
                <div class="specifier-mapping-section" style="background: #fcfcfc; border: 1px solid #eaeaea; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h5 style="margin: 0; color: #555; font-size: 14px;">Mapped from Provider</h5>
                        <button type="button" class="btn-secondary btn-add-specifier">Add Specifier</button>
                    </div>
                    <div class="specifiers-list">
                        <div class="specifier-row">${createSpecifierRowHtml(currentProviderSpecifiers)}</div>
                    </div>
                </div>
 
                <div class="fixed-specifier-mapping-section" style="background: #fcfcfc; border: 1px solid #eaeaea; padding: 15px; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h5 style="margin: 0; color: #555; font-size: 14px;">Fixed Values</h5>
                        <button type="button" class="btn-secondary btn-add-fixed-specifier">Add Fixed Specifier</button>
                    </div>
                    <div class="fixed-specifiers-list">
                        <div class="specifier-row">${createFixedSpecifierRowHtml()}</div>
                    </div>
                </div>
            </div>
 
            <div class="ext-specifier-mapping-section" style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0; color: #2c3e50; font-size: 16px;">Extended specifiers mapping</h4>
                    <button type="button" class="btn-secondary btn-add-ext-specifier">Add Ext. Specifier</button>
                </div>
                <div class="ext-specifiers-list"></div>
            </div>
            
            <div class="outcome-mapping-section" style="display: ${sectionDisplayStyle}; margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0; color: #2c3e50; font-size: 16px;">Outcome mapping</h4>
                    <button type="button" class="btn-secondary btn-add-outcome">Add Outcome</button>
                </div>
                <div class="outcomes-list">
                    <div class="outcome-row">${createOutcomeRowHtml()}</div>
                </div>
            </div>
 
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; border-top: 1px solid #eee; padding-top: 15px;">
                <button type="button" class="btn-secondary btn-view-single-mapping">View mapping</button>
                <button type="button" class="btn-secondary btn-reset-single-mapping">Reset</button>
                <button type="button" class="btn-secondary btn-cancel-single-mapping">Cancel</button>
                <button type="button" class="btn-primary btn-save-single-mapping">Save mapping</button>
            </div>
 
        </div>
    `;
    
    const selectMarket = newSection.querySelector('.hermes-market-select');
    const marketTypeDisplay = newSection.querySelector('.hermes-market-type-display');
    const mappingDetailsWrapper = newSection.querySelector('.mapping-details-wrapper');
    
    const addSpecifierBtn = newSection.querySelector('.btn-add-specifier');
    const specifiersList = newSection.querySelector('.specifiers-list');
    
    const addFixedSpecifierBtn = newSection.querySelector('.btn-add-fixed-specifier');
    const fixedSpecifiersList = newSection.querySelector('.fixed-specifiers-list');
 
    const addExtSpecifierBtn = newSection.querySelector('.btn-add-ext-specifier');
    const extSpecifiersList = newSection.querySelector('.ext-specifiers-list');
    
    const addOutcomeBtn = newSection.querySelector('.btn-add-outcome');
    const outcomesList = newSection.querySelector('.outcomes-list');
    const viewSingleMappingBtn = newSection.querySelector('.btn-view-single-mapping');
    const resetSingleMappingBtn = newSection.querySelector('.btn-reset-single-mapping');
    const cancelSingleMappingBtn = newSection.querySelector('.btn-cancel-single-mapping');
    const saveSingleMappingBtn = newSection.querySelector('.btn-save-single-mapping');
 
    // Kada se izabere Hermes Market
    selectMarket.addEventListener('change', function() {
        if(this.value) {
            marketTypeDisplay.value = hermesMarketTypes[this.value] || "Unknown";
            mappingDetailsWrapper.style.display = 'block';
            updateOutcomeDropdowns(outcomesList, this.value);
        }
    });
 
    // --- LOGIKA ZA DODAVANJE REDOVA ---
    
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
 
    addFixedSpecifierBtn.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.classList.add('specifier-row');
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
 
    addExtSpecifierBtn.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.classList.add('ext-specifier-row');
        newRow.innerHTML = createExtSpecifierRowHtml();
        newRow.querySelector('.btn-remove-ext-specifier').addEventListener('click', () => newRow.remove());
        extSpecifiersList.appendChild(newRow);
    });
 
    addOutcomeBtn.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.classList.add('outcome-row');
        newRow.innerHTML = createOutcomeRowHtml(selectMarket.value);
        newRow.querySelector('.btn-remove-outcome').addEventListener('click', () => newRow.remove());
        outcomesList.appendChild(newRow);
    });
 
    const initialRemoveOutcomeBtn = newSection.querySelector('.btn-remove-outcome');
    if (initialRemoveOutcomeBtn) {
        initialRemoveOutcomeBtn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    }

    viewSingleMappingBtn.addEventListener('click', () => {
        const mappingDefinition = buildMappingDefinition(newSection, currentMappingId, selectedProviderMarketName);
        jsonModalTitle.textContent = "Mapping Definition";
        jsonContent.textContent = JSON.stringify(mappingDefinition, null, 4);
        jsonModal.style.display = "flex";
    });

    resetSingleMappingBtn.addEventListener('click', () => {
        newSection.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        newSection.querySelectorAll('input').forEach(input => {
            input.value = '';
        });

        Array.from(specifiersList.querySelectorAll('.specifier-row')).slice(1).forEach(row => row.remove());
        Array.from(fixedSpecifiersList.querySelectorAll('.specifier-row')).slice(1).forEach(row => row.remove());
        extSpecifiersList.innerHTML = '';
        Array.from(outcomesList.querySelectorAll('.outcome-row')).slice(1).forEach(row => row.remove());
        mappingDetailsWrapper.style.display = 'none';
    });

    cancelSingleMappingBtn.addEventListener('click', () => {
        newSection.remove();
    });
 
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
    const urlProvider = urlParams.get('provider');

    if (urlSport) {
        const sportDisplay = document.getElementById('displaySport');
        if (sportDisplay) sportDisplay.textContent = urlSport;
    }

    if (urlProvider) {
        const providerDisplay = document.getElementById('displayProvider');
        if (providerDisplay) providerDisplay.textContent = urlProvider;
    }

    if (urlMarket) {
        providerMarketSelect.value = urlMarket;
        loadProviderMarket(urlMarket);
    }
});
