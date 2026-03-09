// ===============================================
// GROUND MOUNT LOGIC (South-to-North & Multi-Row Dims)
// ===============================================

// 1. STATE MANAGEMENT (The Row Builder)
let gmRowsList = [{ id: Date.now(), type: 2 }]; 

function renderGMRowsUI() {
    const container = document.getElementById('gm-row-list-container');
    if (!container) return;
    container.innerHTML = "";

    const orientEl = document.querySelector('input[name="orient"]:checked');
    const isPortrait = orientEl && orientEl.value === 'portrait';
    const prefix = isPortrait ? "P" : "L";

    gmRowsList.forEach((r, index) => {
        const div = document.createElement('div');
        div.className = 'walkway-item'; 
        
        const label = document.createElement('span');
        label.innerText = `Row ${index + 1}:`;
        label.style.fontWeight = 'bold';
        label.style.color = '#007bff';
        label.style.fontSize = '12px';

        const sel = document.createElement('select');
        sel.style.width = '100%';
        for (let i = 1; i <= 7; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.innerText = `${prefix}${i} Structure`;
            if (i === r.type) opt.selected = true;
            sel.appendChild(opt);
        }
        
        sel.onchange = (e) => {
            r.type = parseInt(e.target.value);
            if (typeof generateSolarArray === 'function') generateSolarArray(false);
        };

        const delBtn = document.createElement('div');
        delBtn.className = 'del-x';
        delBtn.innerText = '×';
        delBtn.onclick = () => {
            if (gmRowsList.length <= 1) return; 
            gmRowsList = gmRowsList.filter(item => item.id !== r.id);
            renderGMRowsUI();
            if (typeof generateSolarArray === 'function') generateSolarArray(false);
        };

        div.appendChild(label);
        div.appendChild(sel);
        div.appendChild(delBtn);
        container.appendChild(div);
    });
}

function addGMRow() {
    const lastType = gmRowsList[gmRowsList.length - 1].type;
    gmRowsList.push({ id: Date.now(), type: lastType });
    renderGMRowsUI();
    if (typeof generateSolarArray === 'function') generateSolarArray(true);
}

function updateMountTypeOptions() {
    renderGMRowsUI();
}
setTimeout(updateMountTypeOptions, 100);

// ===============================================
// 2. MAIN GENERATION ENGINE
// ===============================================

function generateGroundMount() {
    const cols = parseInt(document.getElementById('gm-cols').value) || 1;
    const tilt = parseFloat(document.getElementById('tilt-angle').value) || 20;
    const factor = parseFloat(document.getElementById('row-factor').value) || 1.5;
    const gapEW_in = parseFloat(document.getElementById('gm-gap-ew').value) || 0; 
    const azimuth = parseFloat(document.getElementById('azimuth').value) || 180;
    
    const orientEl = document.querySelector('input[name="orient"]:checked');
    const orient = orientEl ? orientEl.value : 'landscape';
    const prefix = orient === 'portrait' ? 'P' : 'L'; // Needed for PDF counting

    const dims = Units.getPanelDimsInInches();
    let pLen = dims.l;
    let pWid = dims.w;
    
    if(!pLen || !pWid) return;

    const PPI = (typeof GLOBAL_CONFIG !== 'undefined') ? GLOBAL_CONFIG.PPI : (10/12);

    let singleSlopeDim = (orient === 'portrait') ? pLen : pWid;
    let singleWidthDim = (orient === 'portrait') ? pWid : pLen;

    const rad = tilt * (Math.PI / 180);
    const gap_in = 1; 
    const constant_gap = 5; // The invisible 1" back + 4" front overhang

    // CALCULATE EACH ROW'S MATH DYNAMICALLY
    let currentY = 0; 
    const rowData = [];

    for (let r = 0; r < gmRowsList.length; r++) {
        const mType = gmRowsList[r].type;
        
        // 1. VISUAL & MATH BASE
        const visualSlope_in = (singleSlopeDim * mType) + ((mType - 1) * gap_in);
        const mathSlope_in = visualSlope_in + constant_gap;
        
        // 2. APPLY COSINE FOR PLAN VIEW
        const planVisual_in = visualSlope_in * Math.cos(rad);
        const planMath_in = mathSlope_in * Math.cos(rad);

        // 3. PITCH CALCULATION
        const rowBackHeight_in = mathSlope_in * Math.sin(rad);
        const shadowGap_in = rowBackHeight_in * factor; 
        const pitch_in = planMath_in + shadowGap_in; 
        
        // 4. DRAWING POS: Gap between the blue panels visually
        const visualClearGap_in = pitch_in - planVisual_in;
        const startY_px = currentY - (planVisual_in * PPI); 
        
        rowData.push({
            mType: mType,
            math_slope_in: mathSlope_in,           
            visual_slope_px: planVisual_in * PPI, 
            gap_in: visualClearGap_in,
            gap_px: visualClearGap_in * PPI,
            shadow_gap_in: shadowGap_in, 
            pitch_in: pitch_in,
            startY: startY_px
        });

        currentY = startY_px - (visualClearGap_in * PPI);
    }

    const pW_px = singleWidthDim * PPI;
    const gapEW_px = gapEW_in * PPI;
    const totalH = Math.abs(rowData[rowData.length - 1].startY); 
    const totalW = cols * pW_px + (cols - 1) * gapEW_px; 
    
    const offX = totalW / 2; 
    const offY = totalH / 2;

// --- SMART REPLACE LOGIC (Fixes Flash, Overwrite & Conversions) ---
    const vpt = canvas.viewportTransform;
    let cx = (canvas.width / 2 - vpt[4]) / vpt[0];
    let cy = (canvas.height / 2 - vpt[5]) / vpt[3];
    
    let active = canvas.getActiveObject() || window.lastActiveGroup;
    if (active && canvas.getObjects().indexOf(active) === -1) active = null;

    // THE FIX: Strict Type Check. Stop mutating Elevated arrays into Fix arrays!
    if (active && active.solarConfig && active.solarConfig.type !== 'ground') {
        active = null;
    }
    
    // Auto-Targeting Fix: Keeps real-time updates alive if user clicks off the array, 
    // but ONLY grabs arrays of the correct type.
    if (!active && !window.forceSpawnNew) {
        const existingSolar = canvas.getObjects().filter(o => o.isSolarGroup && o.solarConfig && o.solarConfig.type === 'ground');
        if (existingSolar.length > 0) {
            active = existingSolar[existingSolar.length - 1]; 
            window.lastActiveGroup = active; 
        }
    }

    let preservedDeletions = [];

    if (active && active.isSolarGroup) { 
        preservedDeletions = active.deletedPanels || []; 
        cx = active.left; cy = active.top; canvas.remove(active); 
    } else if (!window.forceSpawnNew) {
        return; 
    } else {
        const solarCount = canvas.getObjects().filter(o => o.isSolarGroup).length;
        const offset = (solarCount * 20) % 150;
        cx += offset; cy += offset;
    }

    // --- DRAW PANELS (Edge-to-Edge) ---
    const objs = [];
    for (let r = 0; r < rowData.length; r++) {
        const row = rowData[r];
        const rowStartY = row.startY + offY; 
        
        for (let c = 0; c < cols; c++) {
            const colX = (c * (pW_px + gapEW_px)) - offX + (pW_px / 2);
            
            for (let s = 0; s < row.mType; s++) {
                const panelId = `${r}_${c}_${s}`;
                
                const panelHeight_px = (singleSlopeDim * Math.cos(rad)) * PPI; 
                const panelGap_px = (gap_in * Math.cos(rad)) * PPI;
                
                if (!preservedDeletions.includes(panelId)) {
                    objs.push(new fabric.Rect({
                        width: pW_px, 
                        height: panelHeight_px,
                        left: colX,
                        top: rowStartY + (s * (panelHeight_px + panelGap_px)) + (panelHeight_px / 2),
                        fill: '#2C7BE5', 
                        stroke: '#000000', 
                        strokeWidth: 0.25,
                        originX: 'center', 
                        originY: 'center',
                        isPanel: true, myRow: r, myCol: c, myIndex: s
                    }));
                }
            }
        }
    }

    // --- ADD DIMENSIONS ---
    const boundW = totalW;
    const boundH = totalH;
    const halfW = boundW / 2;
    const halfH = boundH / 2;

    objs.push(...addDimensionLine(canvas, {x: -halfW, y: -halfH}, {x: halfW, y: -halfH}, formatDim(boundW), -40, false));
    
    // Total footprint dimension 
    const trueMathTotalH_px = boundH + (constant_gap * Math.cos(rad) * PPI);
    objs.push(...addDimensionLine(canvas, {x: halfW, y: -halfH}, {x: halfW, y: halfH}, formatDim(trueMathTotalH_px), 40, true));

    for (let r = 0; r < rowData.length; r++) {
        const row = rowData[r];
        const rTop = row.startY + offY;
        const rBottom = rTop + row.visual_slope_px;
        
        // Output restored to true pure math (Hits exactly 13.41' for L-3)
        objs.push(...addDimensionLine(canvas, {x: -halfW, y: rTop}, {x: -halfW, y: rBottom}, formatDim(row.math_slope_in * PPI), -30, true));

        // Output restored to pure shadow gap math (Hits exactly 5.19')
        if (r < rowData.length - 1) {
            const nextRow = rowData[r + 1];
            const nextBottom = nextRow.startY + offY + nextRow.visual_slope_px; 
            
            objs.push(...addDimensionLine(canvas, {x: -halfW, y: nextBottom}, {x: -halfW, y: rTop}, formatDim(row.shadow_gap_in * PPI), -30, true));
        }
    }

    // --- GROUP AND RENDER ---
    const group = new fabric.Group(objs, {
        left: cx, top: cy, 
        angle: azimuth - 180,
        originX: 'center', originY: 'center',
        subTargetCheck: true, 
        isSolarGroup: true,
        solarConfig: { type: 'ground', prefix: prefix }, 
        trueW: totalW,  
        trueH: totalH,  
        deletedPanels: preservedDeletions, 
        hasControls: false, hasBorders: true, borderColor: '#007bff',
        lockScalingX: true, lockScalingY: true, lockRotation: true
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    
    window.lastActiveGroup = group; 
    
    canvas.requestRenderAll();
}