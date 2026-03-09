// ===============================================
// ELEVATED ARRAY LOGIC (Walkway Config Aware)
// ===============================================

function generateElevated() {
    // 1. Gather Configuration
    const orientEl = document.querySelector('input[name="orient"]:checked');
    if (!orientEl) return; // Safety check
    const orient = orientEl.value;
    
    // Get dimensions via Unit Converter
    const dims = Units.getPanelDimsInInches();
    let pLen = dims.l;
    let pWid = dims.w;
    
    if(!pLen || !pWid) { alert("Please set panel dimensions"); return; }

    // Dimensions in PX (Safe PPI Check)
    const currentPPI = (typeof PPI !== 'undefined') ? PPI : 10/12;
    
    const pW = (orient === 'portrait' ? pWid : pLen) * currentPPI;
    const pH = (orient === 'portrait' ? pLen : pWid) * currentPPI;
    
    // THE FIX: Fallback to 1 instead of 0! 
    // This ensures it always draws at least one panel when swapping structure types.
    const rows = parseInt(document.getElementById('arr-rows').value) || 1;
    const cols = parseInt(document.getElementById('arr-cols').value) || 1;
    
    const gapNS = parseFloat(document.getElementById('gap-ns').value || 1.5) * currentPPI;
    const gapEW = parseFloat(document.getElementById('gap-ew').value || 1.5) * currentPPI;
    const azimuth = parseFloat(document.getElementById('azimuth').value || 180);

  
    // --- Walkway Config ---
    let hMap = {}, vMap = {};
    if (typeof getWalkwayConfig === 'function') {
        const config = getWalkwayConfig();
        hMap = config.hMap;
        vMap = config.vMap;
    } else {
        console.warn("Walkway.js not loaded! Drawing without walkways.");
    }

    // --- SMART REPLACE LOGIC (Fixes Flash, Overwrite & Conversions) ---
    const vpt = canvas.viewportTransform;
    let cx = (canvas.width / 2 - vpt[4]) / vpt[0];
    let cy = (canvas.height / 2 - vpt[5]) / vpt[3];
    
    let active = canvas.getActiveObject() || window.lastActiveGroup;
    if (active && canvas.getObjects().indexOf(active) === -1) active = null;

    // THE FIX: Strict Type Check. Stop mutating Fix arrays into Elevated arrays!
    if (active && active.solarConfig && active.solarConfig.type !== 'elevated') {
        active = null;
    }

    // Auto-Targeting Fix: Keeps real-time updates alive if user clicks off the array
    // but ONLY targets Elevated shapes.
    if (!active && !window.forceSpawnNew) {
        const existingSolar = canvas.getObjects().filter(o => o.isSolarGroup && o.solarConfig && o.solarConfig.type === 'elevated');
        if (existingSolar.length > 0) {
            active = existingSolar[existingSolar.length - 1]; 
            window.lastActiveGroup = active; 
        }
    }

    let preservedDeletions = [];

    if (active && active.isSolarGroup) {
        preservedDeletions = active.deletedPanels || []; 
        cx = active.left; 
        cy = active.top;
        canvas.remove(active);
    } else if (!window.forceSpawnNew) {
        return; 
    } else {
        const solarCount = canvas.getObjects().filter(o => o.isSolarGroup).length;
        const offset = (solarCount * 20) % 150;
        cx += offset; cy += offset;
    }
    // 3. Calculate Grid Positions
    const rowOffsets = []; 
    const colOffsets = []; 
    
    let currentY = 0;
    for(let r = 0; r < rows; r++) {
        rowOffsets.push(currentY);
        currentY += pH; 
        if (r < rows - 1) { 
            if (hMap[r] !== undefined) currentY += hMap[r]; 
            else currentY += gapNS; 
        }
    }
    
    let currentX = 0;
    for(let c = 0; c < cols; c++) {
        colOffsets.push(currentX);
        currentX += pW;
        if (c < cols - 1) {
            if (vMap[c] !== undefined) currentX += vMap[c];
            else currentX += gapEW;
        }
    }
    
    const totalHeight = currentY; 
    const totalWidth = currentX;  
    const offX = totalWidth / 2;
    const offY = totalHeight / 2;

    const objs = [];

    // 4. Draw Panels (Skipping the deleted ones)
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const panelId = `${r}_${c}_0`;
            // Only draw if it wasn't previously deleted
            if (!preservedDeletions.includes(panelId)) {
                objs.push(new fabric.Rect({
                    width: pW, height: pH,
                    left: colOffsets[c] - offX + (pW/2),
                    top: rowOffsets[r] - offY + (pH/2),
                    fill: '#2C7BE5', stroke: '#000000', strokeWidth: 0.5,
                    originX: 'center', originY: 'center',
                    isPanel: true, myRow: r, myCol: c, myIndex: 0
                }));
            }
        }
    }

    // 5. Draw Horizontal Walkways
    Object.keys(hMap).forEach(rIndex => {
        const r = parseInt(rIndex);
        const h = hMap[r];
        const centerY = rowOffsets[r] + pH + (h/2) - offY;
        objs.push(new fabric.Rect({
            width: totalWidth, height: h,
            left: 0, top: centerY,
            fill: '#50C878', 
            originX: 'center', originY: 'center',
            stroke: 'white', strokeWidth: 0
        }));
    });

    // 6. Draw Vertical Walkways
    Object.keys(vMap).forEach(cIndex => {
        const c = parseInt(cIndex);
        const w = vMap[c];
        const centerX = colOffsets[c] + pW + (w/2) - offX;
        objs.push(new fabric.Rect({
            width: w, height: totalHeight,
            left: centerX, top: 0,
            fill: '#50C878',
            originX: 'center', originY: 'center',
            stroke: 'white', strokeWidth: 0
        }));
    });

    // --- PHASE 3: ADD DIMENSIONS ---
    const boundW = totalWidth;
    const boundH = totalHeight;
    const halfW = boundW / 2;
    const halfH = boundH / 2;

    // 1. Overall Horizontal & Vertical Dimensions
    objs.push(...addDimensionLine(canvas, {x: -halfW, y: -halfH}, {x: halfW, y: -halfH}, formatDim(boundW), -40, false));
    objs.push(...addDimensionLine(canvas, {x: halfW, y: -halfH}, {x: halfW, y: halfH}, formatDim(boundH), 40, true));

    // 2. WALKWAY DIMENSIONS
    // Horizontal Walkways (Measured on the left side)
    Object.keys(hMap).forEach(rIndex => {
        const r = parseInt(rIndex);
        const h = hMap[r];
        const centerY = rowOffsets[r] + pH + (h/2) - offY;
        objs.push(...addDimensionLine(canvas, 
            {x: -halfW, y: centerY - (h/2)}, {x: -halfW, y: centerY + (h/2)}, 
            formatDim(h), -20, true
        ));
    });

    // Vertical Walkways (Measured on the top side)
    Object.keys(vMap).forEach(cIndex => {
        const c = parseInt(cIndex);
        const w = vMap[c];
        const centerX = colOffsets[c] + pW + (w/2) - offX;
        objs.push(...addDimensionLine(canvas, 
            {x: centerX - (w/2), y: -halfH}, {x: centerX + (w/2), y: -halfH}, 
            formatDim(w), -20, false
        ));
    });

   // 7. Group & Render
    const group = new fabric.Group(objs, {
        left: cx, top: cy,
        angle: azimuth - 180,
        originX: 'center', originY: 'center',
        subTargetCheck: true, isSolarGroup: true,
        solarConfig: { type: 'elevated' },
        trueW: totalWidth,  
        trueH: totalHeight, 
        deletedPanels: preservedDeletions,
        hasControls: false, hasBorders: true, borderColor: '#007bff',
        lockScalingX: true, lockScalingY: true, lockRotation: true
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    
    window.lastActiveGroup = group; // <--- ADD THIS MEMORY LINK!
    
    canvas.requestRenderAll();
}