document.addEventListener('DOMContentLoaded', () => {

    // Helper funkcija za generisanje Dropdown-a za Specifier
    function createSpecifierRow(containerId, selectedValue = '') {
        const container = document.getElementById(containerId);
        
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.marginBottom = '10px';
        row.style.alignItems = 'center';

        row.innerHTML = `
            <select class="specifier-select" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
                <option value="" disabled selected>Select specifier...</option>
                <option value="total">total</option>
                <option value="goalnr">goalnr</option>
                <option value="hcp">hcp</option>
                <option value="player">player</option>
                <option value="period">period</option>
                <option value="from">from</option>
                <option value="to">to</option>
            </select>
            <button type="button" class="btn-remove" title="Remove" style="padding: 10px 15px; font-weight: bold; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #fff; color: #d9534f; transition: 0.2s;">X</button>
        `;

        row.querySelector('.btn-remove').addEventListener('click', () => {
            row.remove();
        });

        container.appendChild(row);
        if (selectedValue) row.querySelector('select').value = selectedValue;
    }

    // Helper funkcija za generisanje Dropdown-a za Extended Specifier
    function createExtendedSpecifierRow(containerId, selectedValue = '') {
        const container = document.getElementById(containerId);
        
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.marginBottom = '10px';
        row.style.alignItems = 'center';

        row.innerHTML = `
            <select class="extended-specifier-select" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
                <option value="" disabled selected>Select extended specifier...</option>
                <option value="score">score</option>
                <option value="period">period</option>
                <option value="total_for_the_rest">total_for_the_rest</option>
                <option value="hcp_for_the_rest">hcp_for_the_rest</option>
            </select>
            <button type="button" class="btn-remove" title="Remove" style="padding: 10px 15px; font-weight: bold; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #fff; color: #d9534f; transition: 0.2s;">X</button>
        `;

        row.querySelector('.btn-remove').addEventListener('click', () => {
            row.remove();
        });

        container.appendChild(row);
        if (selectedValue) row.querySelector('select').value = selectedValue;
    }

    // Helper funkcija specifično za Outcomes
    function createOutcomeRow(containerId, name = '', description = '') {
        const container = document.getElementById(containerId);
        
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.marginBottom = '10px';
        row.style.alignItems = 'center';

        row.innerHTML = `
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <input type="text" class="outcome-name-input" placeholder="Outcome Name (e.g. {\$competitor1})" value="${name}" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
            </div>
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <input type="text" class="outcome-description-input" placeholder="Outcome Description (e.g. Home team wins)" value="${description}" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
            </div>
            <button type="button" class="btn-remove" title="Remove" style="padding: 10px 15px; font-weight: bold; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #fff; color: #d9534f; transition: 0.2s;">X</button>
        `;

        row.querySelector('.btn-remove').addEventListener('click', () => {
            row.remove();
        });

        container.appendChild(row);
    }

    // --- 1. Specifiers ---
    const addSpecifierBtn = document.getElementById('addSpecifierBtn');
    if(addSpecifierBtn) {
        addSpecifierBtn.addEventListener('click', () => {
            createSpecifierRow('specifiersContainer');
        });
    }

    // --- 2. Extended Specifiers ---
    const addExtendedSpecifierBtn = document.getElementById('addExtendedSpecifierBtn');
    if(addExtendedSpecifierBtn) {
        addExtendedSpecifierBtn.addEventListener('click', () => {
            createExtendedSpecifierRow('extendedSpecifiersContainer');
        });
    }

    // --- 3. Outcomes Type logika ---
    const outcomesTypeRadios = document.querySelectorAll('input[name="outcomesType"]');
    const regularOutcomesWrapper = document.getElementById('regularOutcomesWrapper');
    
    outcomesTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if(this.value === 'Regular') {
                regularOutcomesWrapper.style.display = 'block';
            } else {
                regularOutcomesWrapper.style.display = 'none';
                document.getElementById('outcomesListContainer').innerHTML = '';
            }
        });
    });

    // --- 4. Regular Outcomes dodavanje ---
    const addOutcomeBtn = document.getElementById('addOutcomeBtn');
    if(addOutcomeBtn) {
        addOutcomeBtn.addEventListener('click', () => {
            createOutcomeRow('outcomesListContainer');
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const isEdit = urlParams.get('edit') === 'true';
    const editId = urlParams.get('id') || '';
    const editMarket = urlParams.get('market');
    const editSport = urlParams.get('sport');
    const editType = urlParams.get('type');
    const defaultsByMarket = {
        "1X2": {
            description: "Home, Draw, Away match winner",
            specifiers: ["period"],
            extendedSpecifiers: ["score"],
            outcomes: [
                ["{$competitor1}", "Home competitor wins"],
                ["draw", "Match ends in a draw"],
                ["{$competitor2}", "Away competitor wins"]
            ]
        },
        "Asian Handicap": {
            description: "Handicap betting for the match",
            specifiers: ["hcp"],
            extendedSpecifiers: ["score"],
            outcomes: [
                ["{$competitor1}", "Home competitor with handicap"],
                ["{$competitor2}", "Away competitor with handicap"]
            ]
        },
        "Total Goals": {
            description: "Over/Under total goals",
            specifiers: ["total"],
            extendedSpecifiers: ["score", "period"],
            outcomes: [
                ["over", "Total goals over the line"],
                ["under", "Total goals under the line"]
            ]
        },
        "Anytime goalscorer": {
            description: "Player to score at any time",
            specifiers: ["player"],
            extendedSpecifiers: ["period"],
            outcomes: [
                ["{$player}", "Selected player scores at any time"]
            ]
        },
        "Total Corners": {
            description: "Over/Under total corners in the match",
            specifiers: ["total"],
            extendedSpecifiers: ["period"],
            outcomes: [
                ["over", "Total corners over the line"],
                ["under", "Total corners under the line"]
            ]
        }
    };

    if (isEdit) {
        document.title = 'Edit Market';
        document.getElementById('pageMainTitle').textContent = 'Edit Market';
        document.getElementById('pageSubTitle').textContent = 'Update market definition';
        document.getElementById('saveMarketBtn').textContent = 'Update Market';

        const marketDefaults = defaultsByMarket[editMarket] || { description: '', specifiers: [], extendedSpecifiers: [], outcomes: [] };
        if (editMarket) document.getElementById('marketName').value = editMarket;
        if (marketDefaults.description) document.getElementById('description').value = marketDefaults.description;
        if (editSport) document.getElementById('sport').value = editSport.toLowerCase();
        if (editType) {
            const typeRadio = document.querySelector(`input[name="marketType"][value="${editType}"]`);
            if (typeRadio) typeRadio.checked = true;
        }
        marketDefaults.specifiers.forEach(specifier => createSpecifierRow('specifiersContainer', specifier));
        marketDefaults.extendedSpecifiers.forEach(specifier => createExtendedSpecifierRow('extendedSpecifiersContainer', specifier));
        if (marketDefaults.outcomes.length) {
            const regularOutcomeRadio = document.querySelector('input[name="outcomesType"][value="Regular"]');
            regularOutcomeRadio.checked = true;
            regularOutcomesWrapper.style.display = 'block';
            marketDefaults.outcomes.forEach(([name, description]) => createOutcomeRow('outcomesListContainer', name, description));
        }
    }

    // --- 5. Save market ---
    const saveMarketBtn = document.getElementById('saveMarketBtn');
    if(saveMarketBtn) {
        saveMarketBtn.addEventListener('click', () => {
            const marketName = document.getElementById('marketName').value;
            if(marketName) {
                const actionText = isEdit ? 'updated' : 'added';
                const idText = isEdit && editId ? ` (${editId})` : '';
                alert(`Market "${marketName}"${idText} successfully ${actionText}!`);
            } else {
                alert("Please enter a market name.");
            }
        });
    }
});
