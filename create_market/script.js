document.addEventListener('DOMContentLoaded', () => {

    // Helper funkcija za generisanje Dropdown-a za Specifier
    function createSpecifierRow(containerId) {
        const container = document.getElementById(containerId);
        
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.marginBottom = '10px';
        row.style.alignItems = 'center';

        row.innerHTML = `
            <select style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
                <option value="" disabled selected>Select specifier...</option>
                <option value="total">total</option>
                <option value="goalnr">goalnr</option>
                <option value="hcp">hcp</option>
                <option value="from">from</option>
                <option value="to">to</option>
            </select>
            <button type="button" class="btn-remove" title="Remove" style="padding: 10px 15px; font-weight: bold; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #fff; color: #d9534f; transition: 0.2s;">X</button>
        `;

        row.querySelector('.btn-remove').addEventListener('click', () => {
            row.remove();
        });

        container.appendChild(row);
    }

    // Helper funkcija za generisanje Dropdown-a za Extended Specifier
    function createExtendedSpecifierRow(containerId) {
        const container = document.getElementById(containerId);
        
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.marginBottom = '10px';
        row.style.alignItems = 'center';

        row.innerHTML = `
            <select style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
                <option value="" disabled selected>Select extended specifier...</option>
                <option value="score">score</option>
                <option value="total_for_the_rest">total_for_the_rest</option>
                <option value="hcp_for_the_rest">hcp_for_the_rest</option>
            </select>
            <button type="button" class="btn-remove" title="Remove" style="padding: 10px 15px; font-weight: bold; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #fff; color: #d9534f; transition: 0.2s;">X</button>
        `;

        row.querySelector('.btn-remove').addEventListener('click', () => {
            row.remove();
        });

        container.appendChild(row);
    }

    // Helper funkcija specifično za Outcomes
    function createOutcomeRow(containerId) {
        const container = document.getElementById(containerId);
        
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.marginBottom = '10px';
        row.style.alignItems = 'center';

        row.innerHTML = `
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <input type="text" placeholder="Outcome Name (e.g. {\$competitor1})" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
            </div>
            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <input type="text" placeholder="Outcome Description (e.g. Home team wins)" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
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

    // --- 5. Save market ---
    const saveMarketBtn = document.getElementById('saveMarketBtn');
    if(saveMarketBtn) {
        saveMarketBtn.addEventListener('click', () => {
            const marketName = document.getElementById('marketName').value;
            if(marketName) {
                // IZMENJENO: Tekst u alertu prilagođen novom nazivu dugmeta (added)
                alert(`Hermes Market "${marketName}" successfully added!`);
            } else {
                alert("Please enter a market name.");
            }
        });
    }
});