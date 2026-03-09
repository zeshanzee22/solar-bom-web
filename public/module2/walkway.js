// ===============================================
// WALKWAY CONFIGURATION MANAGER (State-Driven UI)
// ===============================================

// 1. THE MASTER LIST (The Brain)
let walkwayList = []; 
let uniqueIdCounter = 0;
let isDeleteMode = false;

// We need PPI for calculations. If global PPI isn't ready yet, default to 10/12.
const getPPI = () => (typeof PPI !== 'undefined' ? PPI : 10/12);

// --- 2. ADD / REMOVE LOGIC (State Management) ---

function addWalkwayUI(type) {
    const id = uniqueIdCounter++;
    // Default values
    const size = 1.5; // ft
    const index = 1; // After 1st row/col
    
    walkwayList.push({ id, type, size, index });
    renderWalkwayList();

    // Forces the canvas to redraw immediately
    if(typeof generateSolarArray === 'function') generateSolarArray();
}

function removeWalkwayUI(id) {
    walkwayList = walkwayList.filter(w => w.id !== id);
    renderWalkwayList();

    if(typeof generateSolarArray === 'function') generateSolarArray();
}

function updateWalkwayData(id, field, value) {
    const item = walkwayList.find(w => w.id === id);
    if(item) {
        if (field === 'index') {
            item[field] = parseInt(value, 10);
        } else {
            const val = parseFloat(value);
            item[field] = isNaN(val) ? 0 : val; 
        }

        // Updates the canvas without reloading the sidebar list (Preserves Focus)
        if(typeof generateSolarArray === 'function') generateSolarArray();
    }
}

// --- 3. RENDER LOGIC (The Display) ---

function renderWalkwayList() {
    const container = document.getElementById('walkway-list-container');
    if(!container) return;
    
    container.innerHTML = ""; // Wipe slate clean

    // Get current Grid Limits so we don't offer "Row 50" if only 5 rows exist
    const rowsInput = document.getElementById('arr-rows');
    const colsInput = document.getElementById('arr-cols');
    
    // Fallback if inputs aren't loaded yet
    const rowLimit = rowsInput ? parseInt(rowsInput.value) : 10;
    const colLimit = colsInput ? parseInt(colsInput.value) : 10;

    walkwayList.forEach(w => {
        // Create Container for this Item
        const div = document.createElement('div');
        div.className = 'walkway-item';

        // A. Label (H or V)
        const label = document.createElement('span');
        label.innerText = w.type === 'horizontal' ? 'H' : 'V';
        label.style.fontWeight = 'bold';
        label.style.color = w.type === 'horizontal' ? '#32CD32' : '#007bff'; 

        // B. Size Input
        const sizeInput = document.createElement('input');
        sizeInput.type = 'number';
        sizeInput.value = w.size;
        sizeInput.step = 0.5;
        sizeInput.title = "Size (ft)";
        sizeInput.style.width = "50px";
        
        sizeInput.onchange = (e) => updateWalkwayData(w.id, 'size', e.target.value);
        sizeInput.oninput = (e) => updateWalkwayData(w.id, 'size', e.target.value); 

        // C. Position Dropdown (THE FIX IS HERE)
        const posSelect = document.createElement('select');
        
        // Horizontal = Between Rows. Vertical = Between Columns.
        const limit = w.type === 'horizontal' ? rowLimit : colLimit;
        const prefix = w.type === 'horizontal' ? 'Row' : 'Col';

        // Populate Options: "After Row 1" to "After Row X-1"
        for(let i = 1; i < limit; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.innerText = `After ${prefix} ${i}`;
            if(i === w.index) opt.selected = true;
            posSelect.appendChild(opt);
        }
        
        // Handle case where index is out of bounds (e.g. you reduced rows from 10 to 5)
        if (w.index >= limit) {
             const opt = document.createElement('option');
             opt.value = w.index;
             opt.innerText = `(Invalid) ${prefix} ${w.index}`;
             opt.selected = true;
             posSelect.appendChild(opt);
        }

        posSelect.onchange = (e) => updateWalkwayData(w.id, 'index', e.target.value);

        // D. Delete Button
        const delBtn = document.createElement('div');
        delBtn.className = 'del-x';
        delBtn.innerText = '×';
        delBtn.style.cursor = "pointer";
        delBtn.onclick = () => removeWalkwayUI(w.id);

        // Assemble
        div.appendChild(label);
        div.appendChild(sizeInput);
        div.appendChild(posSelect);
        div.appendChild(delBtn);

        container.appendChild(div);
    });
}

// Hook to update dropdowns if user changes the main "Rows" or "Cols" input
function updateWalkwayOptions() {
    renderWalkwayList();
}


// --- 4. EXPORT LOGIC (The Calculation) ---

function getWalkwayConfig() {
    const hMap = {};
    const vMap = {};

    const PIXELS_PER_FOOT = 10; 

    walkwayList.forEach(w => {
        const sizePx = w.size * PIXELS_PER_FOOT; 
        const mapIndex = w.index - 1; 
        
        if (w.type === 'horizontal') hMap[mapIndex] = sizePx;
        else vMap[mapIndex] = sizePx;
    });

    return { hMap, vMap };
}

// --- 5. HELPERS (Delete Mode, Raycasting) ---

function toggleDeleteMode() {
    isDeleteMode = !isDeleteMode;
    const btn = document.getElementById('btn-del-mode');
    
    if(isDeleteMode) {
        btn.innerText = "Delete Panel Mode: ON";
        btn.style.background = "red";
        canvas.defaultCursor = "not-allowed";
    } else {
        btn.innerText = "Delete Panel Mode: OFF";
        btn.style.background = "#dc3545";
        canvas.defaultCursor = "default";
    }
}

// Required for drawing.js hooks
function handleSharedClick(o) {
    if (isDeleteMode && o.target && o.target.isSolarGroup) {
        const sub = findSubTarget(o.target, o.e);
        if (sub && sub.isPanel) {
            // TRACK THE DELETED PANEL ID FOR REGENERATION
            if (!o.target.deletedPanels) o.target.deletedPanels = [];
            o.target.deletedPanels.push(`${sub.myRow}_${sub.myCol}_${sub.myIndex || 0}`);

            o.target.removeWithUpdate(sub);
            canvas.requestRenderAll();
            return true;
        }
    }
    return false;
}
function findSubTarget(group, e) {
    const pointer = canvas.getPointer(e);
    const objects = group.getObjects();
    const groupMatrix = group.calcTransformMatrix();
    const invertedMatrix = fabric.util.invertTransform(groupMatrix);
    const pointInGroup = fabric.util.transformPoint(pointer, invertedMatrix);

    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (obj.containsPoint(pointInGroup)) return obj;
    }
    return null;
}