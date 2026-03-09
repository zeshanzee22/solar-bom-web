// ===============================================
// DRAWING ENGINE (Based on User's Working Code)
// ===============================================

const canvas = new fabric.Canvas('c', {
    width: window.innerWidth - 380, height: window.innerHeight - 30,
    backgroundColor: '#ffffff', selection: false, preserveObjectStacking: true
});

// --- LOCK LOGIC ---
canvas.on('selection:created', (e) => lockObject(e.target));
canvas.on('selection:updated', (e) => lockObject(e.target));

function lockObject(obj) {
    if (!obj) return;
    if (obj.isSolarGroup) return; // Allow Solar groups to move
    
    // Hide controls
    obj.setControlsVisibility({ mtr:false, tl:false, tr:false, bl:false, br:false, ml:false, mr:false, mt:false, mb:false });
    // FORCE HASCONTROLS FALSE (Fixes the issue of handles appearing)
    obj.set({ lockScalingX: true, lockScalingY: true, lockRotation: true, hasBorders: false, hasControls: false });
    canvas.renderAll();
}

// --- HISTORY ---
let history = [];
let redoStack = [];
let isProcessingHistory = false;

function saveState() {
    if (isProcessingHistory) return;

    // THE FIX: Added 'linkedId' so the connection survives Undo/Redo!
    const customProps = ['isSolarGroup', 'solarConfig', 'isPanel', 'myRow', 'myCol', 'myIndex', 'trueW', 'trueH', 'deletedPanels', 'isDimension', 'dimType', 'targetId', 'roofPoints', 'originalLeft', 'originalTop', 'linkedId'];
    const state = canvas.toJSON(customProps);
    
    history.push(JSON.stringify(state));
    redoStack = [];
}

function undo() {
    if (history.length <= 1) return;
    isProcessingHistory = true;
    redoStack.push(history.pop());
    const state = history[history.length - 1];
    canvas.loadFromJSON(state, () => {
        canvas.getObjects().forEach(o => lockObject(o));
        canvas.renderAll();
        isProcessingHistory = false;
    });
}

function redo() {
    if (redoStack.length === 0) return;
    isProcessingHistory = true;
    const state = redoStack.pop();
    history.push(state);
    canvas.loadFromJSON(state, () => {
        canvas.getObjects().forEach(o => lockObject(o));
        canvas.renderAll();
        isProcessingHistory = false;
    });
}

saveState();

// --- TOOLS ---
let currentTool = 'select';
let isDrawing = false;
let linePoints = [];
let activeLine = null;
let tempSegments = [];
let inferenceLines = []; // NEW: Tracks our smart magnetic guides
let typedValue = "";

function setTool(t) {
    currentTool = t;
    isDrawing = false; linePoints = []; typedValue = "";
    
    if(activeLine) canvas.remove(activeLine);
    activeLine = null;
    
    tempSegments.forEach(s => canvas.remove(s));
    tempSegments = [];
    
    inferenceLines.forEach(l => canvas.remove(l)); // Cleanup guides
    inferenceLines = [];

    // THE FIX: Hide the HUD residue from the screen!
    const hud = document.getElementById('hud-input');
    if (hud) hud.style.display = 'none';

    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    if(document.getElementById('btn-'+t)) document.getElementById('btn-'+t).classList.add('active');
    document.querySelectorAll('.param-panel').forEach(p => p.style.display = 'none');
    canvas.defaultCursor = t === 'select' ? 'default' : 'crosshair';
    canvas.renderAll();
}
function openParam(type) {
    setTool('select');
    document.getElementById(type + '-panel').style.display = 'flex';
}

function commitParamShape(type) {
    let obj;
    if (type === 'rect') {
        const w = parseFloat(document.getElementById('rw').value) * 10;
        const h = parseFloat(document.getElementById('rh').value) * 10;
        obj = new fabric.Rect({ width: w, height: h, fill: 'rgba(255,165,0,0.4)', stroke: 'orange', strokeWidth: 2 });
    } else {
        const r = (parseFloat(document.getElementById('cd').value) * 10) / 2;
        obj = new fabric.Circle({ radius: r, fill: 'rgba(255,165,0,0.4)', stroke: 'orange', strokeWidth: 2 });
    }
    obj.set({ left: 100, top: 100 });
    lockObject(obj);
    canvas.add(obj);
    saveState();
    document.querySelectorAll('.param-panel').forEach(p => p.style.display = 'none');
}

// --- MOUSE ---
canvas.on('mouse:move', (opt) => {
    const pointer = canvas.getPointer(opt.e);
    
    // THE FIX: Clean up the old green dot every frame so they don't stack up!
    let oldMarker = canvas.getObjects().find(o => o.id === 'close-snap-marker');
    if (oldMarker) canvas.remove(oldMarker);

    if (isDrawing) {
        const start = linePoints[linePoints.length - 1];
        let endX = pointer.x, endY = pointer.y;
        let color = '#666';

        // 1. Clear old inference lines every frame
        inferenceLines.forEach(l => canvas.remove(l));
        inferenceLines = [];

        const SNAP_THRESH = 15;
        let snappedX = false, snappedY = false;
        let refPtX = null, refPtY = null;

        // NEW: VISUAL GREEN DOT FOR CLOSING POLYGON
        if (linePoints.length >= 2) {
            const firstPt = linePoints[0];
            const distToStart = Math.hypot(pointer.x - firstPt.x, pointer.y - firstPt.y);
            
            if (distToStart < SNAP_THRESH) {
                endX = firstPt.x;
                endY = firstPt.y;
                
                // Draw the visual snap indicator
                const marker = new fabric.Circle({
                    left: firstPt.x, top: firstPt.y,
                    radius: 5, fill: '#28a745', stroke: 'white', strokeWidth: 2,
                    originX: 'center', originY: 'center', 
                    selectable: false, evented: false, // Ensures it doesn't block clicks
                    id: 'close-snap-marker'
                });
                canvas.add(marker);
            }
        }

        // 2. SMART MAGNETIC ALIGNMENT (Checks all previous points)
        if (linePoints.length > 1) {
            for (let i = 0; i < linePoints.length - 1; i++) {
                const pt = linePoints[i];
                if (!snappedX && Math.abs(pointer.x - pt.x) < SNAP_THRESH) {
                    endX = pt.x; snappedX = true; refPtX = pt;
                }
                if (!snappedY && Math.abs(pointer.y - pt.y) < SNAP_THRESH) {
                    endY = pt.y; snappedY = true; refPtY = pt;
                }
            }
        }

        // 3. Orthogonal snapping to CURRENT start point (Overrides inference)
        if (Math.abs(endY - start.y) < SNAP_THRESH) { endY = start.y; color = 'red'; snappedY = false; }
        else if (Math.abs(endX - start.x) < SNAP_THRESH) { endX = start.x; color = 'green'; snappedX = false; }

        // 4. Draw Inference Guides (Dashed blue lines proving alignment)
        if (snappedX && refPtX) {
            const guide = new fabric.Line([refPtX.x, refPtX.y, endX, endY], { stroke: '#007bff', strokeWidth: 1, strokeDashArray: [5, 5], selectable: false });
            inferenceLines.push(guide); canvas.add(guide);
        }
        if (snappedY && refPtY) {
            const guide = new fabric.Line([refPtY.x, refPtY.y, endX, endY], { stroke: '#007bff', strokeWidth: 1, strokeDashArray: [5, 5], selectable: false });
            inferenceLines.push(guide); canvas.add(guide);
        }

        // 5. Draw active drawing line
        if (activeLine) canvas.remove(activeLine);
        activeLine = new fabric.Line([start.x, start.y, endX, endY], { stroke: color, strokeWidth: 2, strokeDashArray: [4, 4], selectable: false });
        canvas.add(activeLine);

        // HUD placement slightly offset so it doesn't cover the cursor
        const hud = document.getElementById('hud-input');
        hud.style.display = 'block'; 
        hud.style.left = (opt.e.clientX + 15) + 'px'; 
        hud.style.top = (opt.e.clientY - 15) + 'px';
        hud.innerText = typedValue.length > 0 ? typedValue + "'" : (Math.hypot(endX-start.x, endY-start.y)/10).toFixed(1) + "'";
    }
    canvas.renderAll();
});



// Add these at the top level
window.lastActiveGroup = null;
window.forceSpawnNew = false; 
window.isSelecting = false; 

window.spawnNewStructure = function() {
    window.forceSpawnNew = true;
    canvas.discardActiveObject(); 
    window.lastActiveGroup = null;
    
    const type = document.getElementById('struct-type').value;
    if (type === 'elevated' && typeof generateElevated === 'function') generateElevated();
    else if (typeof generateGroundMount === 'function') generateGroundMount();
    
    window.forceSpawnNew = false; 
};

canvas.on('mouse:down', (o) => {
    // THE FIX: Delete the green dot permanently the second you click!
    let marker = canvas.getObjects().find(obj => obj.id === 'close-snap-marker');
    if (marker) canvas.remove(marker);

    // ------------------------------------
    // MEMORY TRACKER & SMART UI SYNC
    if (o.target && o.target.isSolarGroup) {
        window.lastActiveGroup = o.target;
        
        const typeSelect = document.getElementById('struct-type');
        if (typeSelect && o.target.solarConfig && o.target.solarConfig.type) {
            if (typeSelect.value !== o.target.solarConfig.type) {
                window.isSelecting = true; 
                typeSelect.value = o.target.solarConfig.type;
                if (typeof toggleStructureUI === 'function') toggleStructureUI(false); 
                window.isSelecting = false; 
            }
        }
    } else if (!o.target) {
        window.lastActiveGroup = null; 
    }
    // ------------------------------------

    // 1. Walkway Hook
    if (typeof handleWalkwayClick === 'function') {
        if(handleWalkwayClick(o)) return;
    }
    // 2. Shared Click (Deletion) Hook
    if (typeof handleSharedClick === 'function') {
        if(handleSharedClick(o)) return;
    }

    if (currentTool === 'select') return;
    
    const pointer = canvas.getPointer(o.e);
    // Because we override endX/endY in mouse:move, activeLine's x2/y2 already contain the perfect snapped coordinates!
    let snapX = activeLine ? activeLine.x2 : pointer.x;
    let snapY = activeLine ? activeLine.y2 : pointer.y;

    // Close Polygon if clicking start
    if (linePoints.length >= 2 && Math.hypot(snapX - linePoints[0].x, snapY - linePoints[0].y) < 15) {
        finalizePolygon(); return;
    }

    if (!isDrawing) { 
        isDrawing = true; 
        linePoints = [{x: snapX, y: snapY}]; 
    } else {
        const p1 = linePoints[linePoints.length-1];
        linePoints.push({x: snapX, y: snapY});
        const l = new fabric.Line([p1.x, p1.y, snapX, snapY], { stroke: 'black', strokeWidth: 2, selectable: true });
        canvas.add(l); tempSegments.push(l);
        saveState();
        typedValue = "";
    }
});

function finalizePolygon() {
    const isRoof = (currentTool === 'line');
    const poly = new fabric.Polygon(linePoints, { fill: isRoof ? 'rgba(0,123,255,0.05)' : 'rgba(255,165,0,0.2)', stroke: 'black', strokeWidth: 2 });
    const labels = createLabels(linePoints, isRoof);
    const group = new fabric.Group([poly, ...labels]);
    
    group.roofPoints = [...linePoints]; 
    // THE FIX: Memorize the exact starting pixel instantly on creation!
    group.originalLeft = group.left; 
    group.originalTop = group.top;   
    
    lockObject(group); 
    canvas.add(group);
    
    setTool('select');
    saveState(); 
}

function finalizeOpenLine() {
    if (linePoints.length < 2) { setTool('select'); return; }
    const labels = [];
    for(let i=0; i < linePoints.length-1; i++){
        const p1 = linePoints[i]; const p2 = linePoints[i+1];
        
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        let deg = angle * 180 / Math.PI;
        if (deg > 90 || deg < -90) deg += 180; 
        
        const perpAngle = angle - Math.PI/2;
        const offsetX = Math.cos(perpAngle) * 15;
        const offsetY = Math.sin(perpAngle) * 15;

        const dist = (Math.hypot(p2.x-p1.x, p2.y-p1.y)/10).toFixed(1)+"'";
        labels.push(new fabric.Text(dist, { 
            fontSize: 12, fontFamily: 'helvetica', 
            left: ((p1.x+p2.x)/2) + offsetX, top: ((p1.y+p2.y)/2) + offsetY, 
            angle: deg, originX: 'center', originY: 'center',
            fill: '#222', fontWeight: 'bold', 
            isDimension: true,
            dimType: 'layout' 
        }));
    }
    const group = new fabric.Group([...tempSegments, ...labels]);
    
    group.roofPoints = [...linePoints]; 
    // THE FIX: Memorize the exact starting pixel instantly on creation!
    group.originalLeft = group.left; 
    group.originalTop = group.top;   
    
    lockObject(group); 
    canvas.add(group);
    setTool('select');
    saveState(); 
}

// --- ROOF DIMENSIONS & STYLING ---
function createLabels(pts, isRoof) {
    const labels = [];
    const centerX = pts.reduce((s,p)=>s+p.x,0)/pts.length;
    const centerY = pts.reduce((s,p)=>s+p.y,0)/pts.length;
    
    pts.forEach((p, i) => {
        const n = pts[(i+1)%pts.length];
        const midX = (p.x + n.x)/2, midY = (p.y + n.y)/2;
        
        // Calculate the angle of the wall
        const angle = Math.atan2(n.y - p.y, n.x - p.x);
        let deg = angle * 180 / Math.PI;
        if (deg > 90 || deg < -90) deg += 180; // Keep text upright
        
        // Calculate outward push vector
        let dx = midX - centerX, dy = midY - centerY;
        const mag = Math.sqrt(dx*dx + dy*dy) || 1;
        
        // Push outward by 15 pixels AND rotate the text!
      labels.push(new fabric.Text((Math.hypot(n.x-p.x, n.y-p.y)/10).toFixed(1)+"'", { 
            fontSize: 12, fontFamily: 'helvetica', 
            left: midX + (dx/mag)*15, top: midY + (dy/mag)*15, 
            angle: deg, originX:'center', originY:'center', fill: '#222', fontWeight: 'bold',
            isDimension: true,
            dimType: 'layout' // <--- ADD THIS TAG
        }));
    });
    return labels;
}

// --- KEYS ---
window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const key = e.key.toLowerCase();

    // ESC KEY FIX: STOP DRAWING & CLEAR GUIDES
    if (key === 'escape') {
        if (isDrawing) {
            isDrawing = false;
            linePoints = [];
            if(activeLine) canvas.remove(activeLine);
            activeLine = null;
            tempSegments.forEach(s => canvas.remove(s));
            tempSegments = [];
            
            inferenceLines.forEach(l => canvas.remove(l)); 
            inferenceLines = []; 
            
            document.getElementById('hud-input').style.display = 'none';
            setTool('select');
        }
        return;
    }

    if (e.ctrlKey && key === 'z') { e.preventDefault(); undo(); }
    if (e.ctrlKey && key === 'y') { e.preventDefault(); redo(); }

    if (!isDrawing) {
        if (key === 'l') setTool('line');
        if (key === 'o') setTool('obs');
        if (key === 's') setTool('select');
        if (key === 'r') openParam('rect');
        if (key === 'c') openParam('circle');
    }

    if (isDrawing) {
        // THE FIX: Allow Backspace to delete HUD text without killing the drawing!
        if (key === 'backspace') {
            e.preventDefault(); // Stop browser from navigating back a page
            if (typedValue.length > 0) {
                typedValue = typedValue.slice(0, -1);
                document.getElementById('hud-input').innerText = typedValue.length > 0 ? typedValue + "'" : "";
            }
            return; // Stop here so it doesn't trigger the object deletion below
        } else if (key === 'k' || (key === 'enter' && typedValue === "")) {
            e.preventDefault(); finalizeOpenLine();
        } else if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
            typedValue += e.key; document.getElementById('hud-input').innerText = typedValue + "'";
        } else if (key === 'enter' && typedValue.length > 0) {
            const px = parseFloat(typedValue) * 10;
            const start = linePoints[linePoints.length-1];
            const angle = Math.atan2(activeLine.y2 - start.y, activeLine.x2 - start.x);
            const snapAngle = Math.round(angle / (Math.PI/2)) * (Math.PI/2);
            const nextPt = { x: start.x + Math.cos(snapAngle)*px, y: start.y + Math.sin(snapAngle)*px };
            linePoints.push(nextPt);
            const l = new fabric.Line([start.x, start.y, nextPt.x, nextPt.y], { stroke: 'black', strokeWidth: 2, selectable: true });
            canvas.add(l); tempSegments.push(l);
            saveState(); typedValue = "";
        }
    }

    // THE FIX: Only allow object deletion if we are NOT actively drawing
    if (!isDrawing && (key === 'delete' || key === 'backspace')) {
        const act = canvas.getActiveObject();
        if (act) {
            canvas.remove(act);
            canvas.discardActiveObject(); 
            saveState();
        }
    } 
});

canvas.on('object:modified', saveState);
window.addEventListener('resize', () => {
   canvas.setWidth(window.innerWidth - 380);
   canvas.setHeight(window.innerHeight - 30);
});

// ===============================================
// PHASE 2: SMART ZOOM & LOCK CONTROLS
// ===============================================

function zoomToFit() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let found = false;
    
    // X-Ray Scanner: Only measures the physical roof and panels, ignoring all text/dimensions!
    canvas.getObjects().forEach(o => {
        if (o.isDimension || o.dimType || o.id === 'compass-container') return; 
        
        let rData = getTrueShapeData(o);
        if (rData && rData.vertices && rData.vertices.length > 0) {
            found = true;
            rData.vertices.forEach(v => {
                minX = Math.min(minX, v.x);
                minY = Math.min(minY, v.y);
                maxX = Math.max(maxX, v.x);
                maxY = Math.max(maxY, v.y);
            });
        }
    });

    if (!found) {
        canvas.setViewportTransform([1,0,0,1,0,0]);
        return;
    }

    let bound = { width: maxX - minX, height: maxY - minY };
    let centerPoint = { x: minX + (bound.width / 2), y: minY + (bound.height / 2) };

    const paddingFactor = 0.85; 
    const availWidth = canvas.width;
    const availHeight = canvas.height;
    const scaleX = (availWidth * paddingFactor) / bound.width;
    const scaleY = (availHeight * paddingFactor) / bound.height;
    
    let scale = Math.min(scaleX, scaleY);
    if (scale > 5) scale = 5; 

    const vpt = canvas.viewportTransform;
    vpt[0] = scale; vpt[3] = scale; 
    vpt[4] = (availWidth / 2) - (centerPoint.x * scale); 
    vpt[5] = (availHeight / 2) - (centerPoint.y * scale); 
    canvas.setViewportTransform(vpt);
    canvas.requestRenderAll();
}
// 2. Lock Layout Logic
let isLayoutLocked = false;

function toggleLayoutLock() {
    isLayoutLocked = !isLayoutLocked;
    const btn = document.getElementById('btn-lock');
    
    if(btn) {
        btn.innerHTML = isLayoutLocked ? "Unlock Roof 🔓" : "Lock Roof 🔒";
        btn.style.background = isLayoutLocked ? "#dc3545" : "#333";
        btn.style.color = "white";
    }

    // Lock/Unlock the ROOF layout (lines, polygons, etc.)
    canvas.getObjects().forEach(obj => {
        if (!obj.isSolarGroup) {
            obj.set({
                selectable: !isLayoutLocked, 
                evented: !isLayoutLocked,    
                lockMovementX: isLayoutLocked,
                lockMovementY: isLayoutLocked
            });
        }
    });
    
    if(isLayoutLocked) canvas.discardActiveObject();
    canvas.requestRenderAll();
}

// ===============================================
// PHASE 3: MOUSE WHEEL ZOOM
// ===============================================

canvas.on('mouse:wheel', function(opt) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    
    // Zoom factor: 0.999^delta usually gives smooth control
    zoom *= 0.999 ** delta;
    
    // Limit Zoom (Prevent infinite zoom in/out)
    if (zoom > 20) zoom = 20;
    if (zoom < 0.1) zoom = 0.1;
    
    // Zoom to the point where the mouse is
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    
    opt.e.preventDefault();
    opt.e.stopPropagation();
});

// Optional: Enable Panning (Holding Alt + Drag)
canvas.on('mouse:down', function(opt) {
    var evt = opt.e;
    if (evt.altKey === true) {
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
    }
});
canvas.on('mouse:move', function(opt) {
    if (this.isDragging) {
        var e = opt.e;
        var vpt = this.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
    }
});
canvas.on('mouse:up', function(opt) {
    // on mouse up we want to recalculate new interaction
    // for all objects, so we call setViewportTransform
    this.setViewportTransform(this.viewportTransform);
    this.isDragging = false;
    this.selection = true;
});

// --- TOGGLE DIMENSIONS ENGINE ---
let showLayoutDims = true;
let showPanelDims = true;
let showPlacementDims = true;

function toggleLayoutDims() {
    showLayoutDims = !showLayoutDims;
    const btn = document.getElementById('btn-layout-dims');
    if(btn) {
        btn.innerHTML = showLayoutDims ? "Layout Dims ON" : "Layout Dims OFF";
        btn.style.background = showLayoutDims ? "#FFDC6D" : "#6c757d";
    }
    updateDimVisibility();
}

function togglePanelDims() {
    showPanelDims = !showPanelDims;
    const btn = document.getElementById('btn-panel-dims');
    if(btn) {
        btn.innerHTML = showPanelDims ? "Panel Dims ON" : "Panel Dims OFF";
        btn.style.background = showPanelDims ? "#FFDC6D" : "#6c757d";
    }
    updateDimVisibility();
}

function togglePlacementDims() {
    showPlacementDims = !showPlacementDims;
    const btn = document.getElementById('btn-placement-dims');
    if(btn) {
        btn.innerHTML = showPlacementDims ? "Placement Dims ON" : "Placement Dims OFF";
        btn.style.background = showPlacementDims ? "#FFDC6D" : "#6c757d";
    }
    updateDimVisibility();
}

function updateDimVisibility() {
    canvas.getObjects().forEach(obj => {
        // 1. Standalone Placement Dims
        if (obj.dimType === 'placement') {
            obj.set('visible', showPlacementDims);
        }
        
        // 2. Groups (Roof Polygons & Solar Arrays)
        // THE FIX: We must search inside ALL groups and mark the group 'dirty' so Fabric redraws it
        if (obj.type === 'group') {
            let changed = false;
            obj.getObjects().forEach(sub => {
                if (sub.dimType === 'layout') {
                    sub.set('visible', showLayoutDims);
                    changed = true;
                } else if (sub.isDimension || sub.stroke === '#007bff' || sub.stroke === '#555') {
                    if(sub.type === 'text' || sub.type === 'line') {
                        sub.set('visible', showPanelDims);
                        changed = true;
                    }
                }
            });
            if (changed) obj.dirty = true; // Forces group to re-render to apply visibility
        }
    });
    canvas.requestRenderAll();
}


// ===============================================
// PHASE 4: CORNER SNAPPING & INWARD OFFSET PROMPT
// ===============================================

let dragGuides = [];

function getTrueShapeData(fabricObj) {
    if (fabricObj.id === 'close-snap-marker') return null;

    // Force coords update to ensure bounding boxes are perfectly aligned
    fabricObj.setCoords();

    // 1. SOLAR GROUPS (Arrays)
    if (fabricObj.isSolarGroup) {
        let panels = fabricObj.getObjects().filter(o => o.isPanel);
        if (panels.length === 0) return null;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        panels.forEach(p => {
            let hw = p.width / 2;
            let hh = p.height / 2;
            minX = Math.min(minX, p.left - hw);
            maxX = Math.max(maxX, p.left + hw);
            minY = Math.min(minY, p.top - hh);
            maxY = Math.max(maxY, p.top + hh);
        });

        let matrix = fabricObj.calcTransformMatrix();
        let localPts = [
            {x: minX, y: minY}, {x: maxX, y: minY}, {x: maxX, y: maxY}, {x: minX, y: maxY}
        ];
        let absPts = localPts.map(pt => fabric.util.transformPoint(pt, matrix));

        return {
            vertices: absPts,
            bounds: { tl: absPts[0], tr: absPts[1], br: absPts[2], bl: absPts[3] }
        };
    }

    // 2. ROOF LAYOUTS (Polygons/Open Lines)
    if (fabricObj.roofPoints && fabricObj.roofPoints.length > 0) {
        // Fallback for objects loaded from old save states
        if (fabricObj.originalLeft === undefined) {
            fabricObj.originalLeft = fabricObj.left;
            fabricObj.originalTop = fabricObj.top;
        }
        
        // Calculate the exact distance moved since creation
        let dx = fabricObj.left - fabricObj.originalLeft;
        let dy = fabricObj.top - fabricObj.originalTop;

        // Apply that exact distance to the raw coordinate points
        let absPts = fabricObj.roofPoints.map(p => ({ x: p.x + dx, y: p.y + dy }));

        let minX = Math.min(...absPts.map(p => p.x));
        let maxX = Math.max(...absPts.map(p => p.x));
        let minY = Math.min(...absPts.map(p => p.y));
        let maxY = Math.max(...absPts.map(p => p.y));

        return {
            vertices: absPts,
            bounds: {
                tl: { x: minX, y: minY },
                tr: { x: maxX, y: minY },
                bl: { x: minX, y: maxY },
                br: { x: maxX, y: maxY }
            }
        };
    }

    // 3. SIMPLE SHAPES (Rectangles, Circles)
    return {
        vertices: [fabricObj.aCoords.tl, fabricObj.aCoords.tr, fabricObj.aCoords.br, fabricObj.aCoords.bl],
        bounds: fabricObj.aCoords
    };
}

// Ensure object:moving forces the dragged object to update its position
canvas.on('object:moving', (e) => {
    const obj = e.target;
    if (obj.isDimension) return; 

    dragGuides.forEach(l => canvas.remove(l));
    dragGuides = [];

    const hud = document.getElementById('hud-input');
    if (hud) hud.style.display = 'none';

    // Force refresh coordinates on the object you are actively dragging
    obj.setCoords();

    if (!obj.linkedId) obj.linkedId = 'obj_' + Date.now();
    let oldDims = canvas.getObjects().filter(o => o.dimType === 'placement' && o.targetId === obj.linkedId);
    oldDims.forEach(d => canvas.remove(d));

    let roofVertices = [];
    canvas.getObjects().forEach(o => {
        if (o !== obj && !o.isDimension) {
            let rData = getTrueShapeData(o);
            if (rData && rData.vertices) {
                roofVertices.push(...rData.vertices);
            }
        }
    });

    if (roofVertices.length === 0) return;

    let oData = getTrueShapeData(obj);
    let objCorners = [];

    if (obj.roofPoints && obj.roofPoints.length > 0) {
        oData.vertices.forEach((v, i) => {
            objCorners.push({ id: 'v' + i, name: 'Vertex ' + (i+1), x: v.x, y: v.y });
        });
    } else {
        objCorners = [
            { id: 'tl', name: 'Top-Left', x: oData.bounds.tl.x, y: oData.bounds.tl.y },
            { id: 'tr', name: 'Top-Right', x: oData.bounds.tr.x, y: oData.bounds.tr.y },
            { id: 'bl', name: 'Bottom-Left', x: oData.bounds.bl.x, y: oData.bounds.bl.y },
            { id: 'br', name: 'Bottom-Right', x: oData.bounds.br.x, y: oData.bounds.br.y }
        ];
    }

    let bestSnap = null;
    let minDistance = 50;

    roofVertices.forEach(rv => {
        objCorners.forEach(corner => {
            let d = Math.hypot(corner.x - rv.x, corner.y - rv.y);
            if (d < minDistance) {
                minDistance = d;
                bestSnap = {
                    corner: corner,
                    roofPt: rv,
                    dx: rv.x - corner.x,
                    dy: rv.y - corner.y
                };
            }
        });
    });

    if (bestSnap) {
        obj.set({ left: obj.left + bestSnap.dx, top: obj.top + bestSnap.dy });
        obj.setCoords();
        
        let marker = new fabric.Circle({
            left: bestSnap.roofPt.x, top: bestSnap.roofPt.y,
            radius: 6, fill: '#dc3545', originX: 'center', originY: 'center', selectable: false
        });
        dragGuides.push(marker);
        canvas.add(marker);
        
        obj.lastSnapData = bestSnap;
    } else {
        obj.lastSnapData = null;
    }
});




// 5. Show Prompt on Drop
canvas.on('object:modified', (e) => {
    dragGuides.forEach(l => canvas.remove(l));
    dragGuides = [];

    const obj = e.target;
    if (obj && !obj.isDimension && obj.lastSnapData) {
        showPrecisionPrompt(obj);
    } else {
        saveState();
    }
});

function showPrecisionPrompt(obj) {
    let existing = document.getElementById('precision-prompt');
    if (existing) existing.remove();

    const snap = obj.lastSnapData;
    
    const div = document.createElement('div');
    div.id = 'precision-prompt';
    div.style.cssText = 'position:absolute; left:50%; top:20px; transform:translateX(-50%); background:#fff; padding:15px; border:2px solid #007bff; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.2); z-index:1000; display:flex; gap:10px; align-items:center; font-family:sans-serif; font-size:14px;';

    div.innerHTML = `
        <strong>Offset inward from ${snap.corner.name}:</strong>
        <label>↔ X (ft): <input type="number" id="prec-x" value="0.0" step="0.5" style="width:60px;"></label>
        <label>↕ Y (ft): <input type="number" id="prec-y" value="0.0" step="0.5" style="width:60px;"></label>
        <button id="prec-apply" style="background:#28a745; color:#fff; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Apply</button>
        <button id="prec-close" style="background:#dc3545; color:#fff; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Done</button>
    `;

    document.body.appendChild(div);

    document.getElementById('prec-apply').onclick = () => {
        const offsetX = parseFloat(document.getElementById('prec-x').value) * 10;
        const offsetY = parseFloat(document.getElementById('prec-y').value) * 10;
        
        obj.setCoords();
        let oData = getTrueShapeData(obj);
        
        // Find exact coordinates of the snapped point (Vertex or Bound)
        let currentX, currentY;
        if (snap.corner.id.startsWith('v')) {
            let vIndex = parseInt(snap.corner.id.substring(1));
            currentX = oData.vertices[vIndex].x;
            currentY = oData.vertices[vIndex].y;
        } else {
            currentX = oData.bounds[snap.corner.id].x;
            currentY = oData.bounds[snap.corner.id].y;
        }
        
        // Perfect reset to the snap point
        let resetDx = snap.roofPt.x - currentX;
        let resetDy = snap.roofPt.y - currentY;
        obj.set({ left: obj.left + resetDx, top: obj.top + resetDy });
        obj.setCoords();

        // FIX: Dynamically find direction to push INWARD towards the object's center
        oData = getTrueShapeData(obj);
        let centerX = (oData.bounds.tl.x + oData.bounds.tr.x) / 2;
        let centerY = (oData.bounds.tl.y + oData.bounds.bl.y) / 2;
        
        let pushX = (snap.roofPt.x <= centerX) ? offsetX : -offsetX;
        let pushY = (snap.roofPt.y <= centerY) ? offsetY : -offsetY;

        obj.set({ left: obj.left + pushX, top: obj.top + pushY });
        obj.setCoords();

        // ==========================================
        // L-SHAPE PLACEMENT DIMENSIONS
        // ==========================================
        if (offsetX > 0 || offsetY > 0) {
            let dimPieces = [];
            let objX = snap.roofPt.x + pushX;
            let objY = snap.roofPt.y + pushY;

            let isBottom = (snap.roofPt.y > centerY);
            let isRight = (snap.roofPt.x > centerX);

            if (offsetX > 0) {
                let sX = objX;
                let eX = snap.roofPt.x;
                let y = objY; 
                
                dimPieces.push(new fabric.Line([sX, y, eX, y], { 
                    stroke: 'black', strokeWidth: 1.5, strokeDashArray: [4, 4], selectable: false 
                }));
                
                let textY = isBottom ? y - 10 : y + 10;
                
                dimPieces.push(new fabric.Text((offsetX / 10).toFixed(1) + "'", {
                    left: (sX + eX) / 2, top: textY, fontSize: 12, fontFamily: 'helvetica', 
                    originX: 'center', originY: 'center', fill: 'black', fontWeight: 'bold'
                }));
            }

            if (offsetY > 0) {
                let sY = objY;
                let eY = snap.roofPt.y;
                let x = objX;
                
                dimPieces.push(new fabric.Line([x, sY, x, eY], { 
                    stroke: 'black', strokeWidth: 1.5, strokeDashArray: [4, 4], selectable: false 
                }));
                
                let textX = isRight ? x - 15 : x + 15; 
                
                dimPieces.push(new fabric.Text((offsetY / 10).toFixed(1) + "'", {
                    left: textX, top: (sY + eY) / 2, fontSize: 12, fontFamily: 'helvetica', 
                    originX: 'center', originY: 'center', fill: 'black', fontWeight: 'bold'
                }));
            }

            if (dimPieces.length > 0) {
                if (!obj.linkedId) obj.linkedId = 'obj_' + Date.now();
                let placementGroup = new fabric.Group(dimPieces, {
                    selectable: false, evented: false, 
                    isDimension: true, dimType: 'placement', targetId: obj.linkedId
                });
                
                placementGroup.set('visible', showPlacementDims);
                canvas.add(placementGroup);
            }
        }

        canvas.requestRenderAll();
    };

    document.getElementById('prec-close').onclick = () => {
        div.remove();
        saveState();
    };
}



// ===============================================
// PHASE 5: REAL-TIME STATS DASHBOARD OBSERVER
// ===============================================

window.updateStatsBox = function() {
    if (typeof canvas === 'undefined' || !canvas) return; 
    
    let totalPanels = 0;
    let fixStructures = {}; 
    let elevatedCount = 0;

    // 1. Scan the canvas for Solar Arrays
    canvas.getObjects().forEach(obj => {
        if (obj.isSolarGroup) {
            let panels = obj.getObjects().filter(o => o.isPanel);
            totalPanels += panels.length;

            if (obj.solarConfig && obj.solarConfig.type === 'ground') {
                let prefix = obj.solarConfig.prefix || 'L';
                let structMap = {};
                
                // Group panels by their mathematical Row and Column to detect structure sizes
                panels.forEach(p => {
                    let key = p.myRow + '_' + p.myCol;
                    structMap[key] = (structMap[key] || 0) + 1;
                });
                
                // Tally up the sizes (e.g., L-3, P-2)
                for (let key in structMap) {
                    let count = structMap[key];
                    let sName = prefix + "-" + count;
                    fixStructures[sName] = (fixStructures[sName] || 0) + 1;
                }
            } else if (obj.solarConfig && obj.solarConfig.type === 'elevated') {
                elevatedCount++; // Counts each elevated array block
            }
        }
    });

    // 2. Fetch Wattage Safely
    let watt = 540; // THE FIX: Base Fallback so it never multiplies by 0!
    const pModelEl = document.getElementById('panel-model');
    const pModel = pModelEl ? pModelEl.value : 'custom';
    
    if (pModel === 'custom') {
        const customWattEl = document.getElementById('custom-watt');
        watt = customWattEl && customWattEl.value ? parseFloat(customWattEl.value) : 540;
    } else if (typeof PANEL_DB !== 'undefined' && PANEL_DB[pModel]) {
        watt = PANEL_DB[pModel].watt || PANEL_DB[pModel].power || parseFloat(pModel.match(/\d+/)?.[0]) || 540;
    }

    // 3. Math & UI Updates
    let totalCapacitykW = (totalPanels * watt) / 1000;

    const setTxt = (id, txt) => { 
        let el = document.getElementById(id); 
        if(el) el.innerText = txt; 
    };
    
    setTxt('stat-watt', watt + " W");
    setTxt('stat-qty', totalPanels);
    setTxt('stat-cap', totalCapacitykW.toFixed(2) + " kW");
    
    let fixText = Object.entries(fixStructures).map(([k, v]) => `${v}x ${k}`).join(', ');
    setTxt('stat-fix', fixText || "0");
    setTxt('stat-elev', elevatedCount);
};

// 4. Hook observers
canvas.on('object:added', window.updateStatsBox);
canvas.on('object:removed', window.updateStatsBox);
canvas.on('object:modified', window.updateStatsBox);

document.addEventListener('input', (e) => {
    if (e.target.id === 'custom-watt' || e.target.tagName === 'SELECT') {
        window.updateStatsBox();
    }
});