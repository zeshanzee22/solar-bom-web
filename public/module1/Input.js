// --- WALKWAY LIST MANAGER ---
let walkwayList = []; 
let uniqueIdCounter = 0;

function addWalkwayUI(type) {
    const id = uniqueIdCounter++;
    // Defaults: 1.5ft size, placed after Index 1
    walkwayList.push({ id, type, size: 1.5, index: 1 });
    renderWalkwayList();
    if(typeof calculateBOM === 'function') calculateBOM();
}

function removeWalkwayUI(id) {
    walkwayList = walkwayList.filter(w => w.id !== id);
    renderWalkwayList();
    if(typeof calculateBOM === 'function') calculateBOM();
}

function updateWalkwayData(id, field, value) {
    const item = walkwayList.find(w => w.id === id);
    if(item) {
        item[field] = parseFloat(value);
        if(typeof calculateBOM === 'function') calculateBOM();
    }
}

function renderWalkwayList() {
    const container = document.getElementById('walkway-list-container');
    if(!container) return;
    container.innerHTML = ""; 

    const rows = parseInt(document.getElementById('PVQtyNS').value) || 1;
    const cols = parseInt(document.getElementById('PVQtyEW').value) || 1;

    walkwayList.forEach(w => {
        const div = document.createElement('div');
        div.style.cssText = "display:flex; gap:10px; align-items:center; background:#f1f1f1; padding:8px; margin-bottom:5px; border-radius:4px; border:1px solid #ddd;";
        
        // --- LABELS SWAPPED AS REQUESTED ---
        // Horizontal (in code) adds to Slope. You want this called "E-W Walkway".
        // Vertical (in code) adds to Width. You want this called "N-S Walkway".
        const labelText = w.type === 'horizontal' ? 'E-W Walkway' : 'N-S Walkway';
        
        const label = document.createElement('span');
        label.innerText = labelText;
        label.style.fontWeight = 'bold';
        label.style.fontSize = '0.85em';
        
        // Size Input
        const sizeInput = document.createElement('input');
        sizeInput.type = 'number';
        sizeInput.value = w.size;
        sizeInput.style.width = "50px";
        sizeInput.onchange = (e) => updateWalkwayData(w.id, 'size', e.target.value);
        
        // Position Dropdown
        const posSelect = document.createElement('select');
        
        // --- POSITION LOGIC SWAPPED AS REQUESTED ---
        // Horizontal (E-W) usually splits Rows. You asked to say "After Col".
        // Vertical (N-S) usually splits Cols. You asked to say "After Row".
        const limit = w.type === 'horizontal' ? rows : cols;
        const prefix = w.type === 'horizontal' ? 'After Col' : 'After Row'; 
        
        for(let i=1; i < limit; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.innerText = `${prefix} ${i}`;
            if(i === w.index) opt.selected = true;
            posSelect.appendChild(opt);
        }
        posSelect.onchange = (e) => updateWalkwayData(w.id, 'index', e.target.value);

        // Delete Button
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '&times;';
        delBtn.style.cssText = "background:#ff4d4d; color:white; border:none; width:24px; height:24px; border-radius:50%; cursor:pointer; font-weight:bold;";
        delBtn.onclick = () => removeWalkwayUI(w.id);

        div.appendChild(label);
        div.appendChild(sizeInput);
        div.appendChild(document.createTextNode("ft"));
        div.appendChild(posSelect);
        div.appendChild(delBtn);
        container.appendChild(div);
    });
}

function updateWalkwayOptions() {
    renderWalkwayList();
}

// --- UPDATED STANDARD INPUT HELPERS ---
function createInput(id, label, defaultVal, defaultUnit = 'ft') {
    document.write(`
        <div class="input-wrapper">
            <label>${label}</label>
            <div class="input-group">
                <input type="number" id="${id}" step="any" value="${defaultVal}">
                <select id="${id}_unit">
                    <option value="mm" ${defaultUnit==='mm'?'selected':''}>mm</option>
                    <option value="cm" ${defaultUnit==='cm'?'selected':''}>cm</option>
                    <option value="inch" ${defaultUnit==='inch'?'selected':''}>inch</option>
                    <option value="ft" ${defaultUnit==='ft'?'selected':''}>ft</option>
                    <option value="m" ${defaultUnit==='m'?'selected':''}>m</option>
                </select>
            </div>
        </div>`);
}

function createSimpleInput(id, label, defVal) {
    document.write(`
        <div>
            <label style="font-size:0.8em">${label}</label>
            <div class="input-group">
                <input type="number" id="${id}" value="${defVal}">
                <select id="${id}_unit">
                    <option value="mm" selected>mm</option>
                    <option value="cm">cm</option>
                    <option value="inch">inch</option>
                    <option value="ft">ft</option>
                </select>
            </div>
        </div>`);
}function applyProfile(type, value) {
    if(!value) return; 
    const [h, w, cat] = value.split(',');
    document.getElementById(type+'H').value = h;
    document.getElementById(type+'W').value = w;
    document.getElementById(type+'H_unit').value = 'inch';
    document.getElementById(type+'W_unit').value = 'inch';
}
function toggleCustomPanel() {
    const pmod = document.getElementById('PMod').value;
    const custDiv = document.getElementById('CustomPanelInputs');
    if(pmod === 'Custom') custDiv.classList.remove('hidden');
    else custDiv.classList.add('hidden');
}
function checkTopPlate() {
    const colVal = document.getElementById('ColProfile').value;
    const tpSec = document.getElementById('TopPlateSection');
    if (colVal && colVal.includes('Round Pipe')) {
        tpSec.classList.remove('hidden');
    } else {
        tpSec.classList.add('hidden');
    }
}
function resetInputs() {
    walkwayList = []; 
    location.reload(); 
}


// --- FORCE DEFAULT TO 585W ---
window.addEventListener('load', function() {
    const dropdown = document.getElementById('PMod');
    if (dropdown) {
        dropdown.value = "585W"; // Selects 585W
        
        // Update the UI (Hide custom fields, recalculate)
        if (typeof toggleCustomPanel === 'function') toggleCustomPanel();
        if (typeof calculateBOM === 'function') calculateBOM();
    }
});


// --- TOGGLE CUSTOM CANTILEVER UI ---
function toggleCustomCLNS() {
    const isChecked = document.getElementById('CustomCLNSCheck').checked;
    const customDiv = document.getElementById('CustomCLNSDiv');
    const standardDiv = document.getElementById('StandardCantileverDiv');
    
    if (isChecked) {
        customDiv.classList.remove('hidden');
        standardDiv.classList.add('hidden'); 
    } else {
        customDiv.classList.add('hidden');
        standardDiv.classList.remove('hidden'); 
    }
    
    // Auto-recalculate BOM when toggled
    if (typeof calculateBOM === 'function') calculateBOM();
}