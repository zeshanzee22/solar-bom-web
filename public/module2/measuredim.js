// ===============================================
// SKETCHUP-STYLE TAPE MEASURE TOOL
// ===============================================

let measureState = 0; // 0 = Idle, 1 = Drawing, 2 = Frozen
let measureStartPt = null;
let measureTempLine = null;
let measureSnapDot = null;
let measureTextObj = null;

// 1. KEYBIND: Press 'M' to activate Tape Measure
window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const key = e.key.toLowerCase();
    
    // Activate tool
    if (key === 'm') {
        setTool('measure'); 
        resetMeasureTool();
        canvas.defaultCursor = 'crosshair';
    }
    
    // Clear graphics if ESC is pressed
    if (key === 'escape' && currentTool === 'measure') {
        resetMeasureTool();
        setTool('select');
    }
});

// Clean up temporary graphics
function resetMeasureTool() {
    if (measureTempLine) canvas.remove(measureTempLine);
    if (measureSnapDot) canvas.remove(measureSnapDot);
    if (measureTextObj) canvas.remove(measureTextObj);
    
    measureTempLine = null;
    measureSnapDot = null;
    measureTextObj = null;
    measureStartPt = null;
    measureState = 0;
    
    canvas.requestRenderAll();
}

// MATH HELPER: Finds the closest point on a line segment to your mouse pointer
function getClosestPointOnSegment(p, a, b) {
    const atob = { x: b.x - a.x, y: b.y - a.y };
    const atop = { x: p.x - a.x, y: p.y - a.y };
    const len2 = atob.x * atob.x + atob.y * atob.y;
    if (len2 === 0) return a;
    let t = (atop.x * atob.x + atop.y * atob.y) / len2;
    t = Math.max(0, Math.min(1, t)); // Clamp to the line segment
    return { x: a.x + t * atob.x, y: a.y + t * atob.y };
}

// THE FIX: Digs inside groups and extracts TRUE absolute coordinates
function extractAllGeometry() {
    let vertices = [];
    let segments = [];

    canvas.getObjects().forEach(obj => {
        if (obj.isDimension || obj.dimType || obj.id === 'measure-dot' || obj.id === 'compass-container') return;

        if (obj.isSolarGroup) {
            obj.getObjects().forEach(sub => {
                if (sub.isPanel || sub.type === 'rect') {
                    // THE MATH FIX: Get the absolute matrix of the sub-object directly on the canvas
                    let matrix = sub.calcTransformMatrix(); 
                    let hw = sub.width / 2;
                    let hh = sub.height / 2;
                    
                    // Since panels are drawn from 'center', local bounds are just -hw to +hw
                    let localPts = [
                        {x: -hw, y: -hh}, 
                        {x: hw, y: -hh},
                        {x: hw, y: hh}, 
                        {x: -hw, y: hh}
                    ];
                    
                    let absPts = localPts.map(pt => fabric.util.transformPoint(pt, matrix));
                    vertices.push(...absPts);
                    
                    // Connect the 4 corners to make 4 line segments
                    for(let i=0; i<4; i++){
                        segments.push({ p1: absPts[i], p2: absPts[(i+1)%4] });
                    }
                }
            });
        } else {
            // Roof Polygons or standalone objects
            let data = typeof getTrueShapeData === 'function' ? getTrueShapeData(obj) : null;
            if (data && data.vertices && data.vertices.length > 0) {
                vertices.push(...data.vertices);
                for(let i=0; i<data.vertices.length; i++){
                    segments.push({ p1: data.vertices[i], p2: data.vertices[(i+1)%data.vertices.length] });
                }
            }
        }
    });

    return { vertices, segments };
}

// THE SCANNER: Determines if the mouse is close enough to snap
function getMeasureSnapPoint(pointer) {
    let bestPt = { x: pointer.x, y: pointer.y };
    let zoom = canvas.getZoom() || 1;
    let minDistance = 15 / zoom; // Keeps snap radius consistent regardless of zoom
    let isSnapped = false;

    const geo = extractAllGeometry();

    // 1. SNAP TO EDGES (Line Segments)
    geo.segments.forEach(seg => {
        const closest = getClosestPointOnSegment(pointer, seg.p1, seg.p2);
        const d = Math.hypot(pointer.x - closest.x, pointer.y - closest.y);
        
        if (d < minDistance) {
            minDistance = d;
            bestPt = closest;
            isSnapped = true;
        }
    });

    // 2. SNAP TO CORNERS (Vertices override edges for precision)
    geo.vertices.forEach(v => {
        const d = Math.hypot(pointer.x - v.x, pointer.y - v.y);
        // Add +5 magnetic pull to corners so they are easier to grab
        if (d < minDistance + (5 / zoom)) { 
            minDistance = d;
            bestPt = { x: v.x, y: v.y };
            isSnapped = true;
        }
    });

    return { pt: bestPt, isSnapped: isSnapped };
}

// ===============================================
// ROBUST MOUSE EVENTS FOR TAPE MEASURE
// ===============================================

canvas.on('mouse:move', (opt) => {
    if (currentTool !== 'measure') {
        if (measureSnapDot) {
            canvas.remove(measureSnapDot);
            measureSnapDot = null;
        }
        return;
    }

    const pointer = canvas.getPointer(opt.e);
    const snapData = getMeasureSnapPoint(pointer);
    const snapPt = snapData.pt;

    if (!measureSnapDot) {
        measureSnapDot = new fabric.Circle({
            radius: 3, 
            fill: '#cccccc', 
            originX: 'center', originY: 'center',
            selectable: false, evented: false, 
            id: 'measure-dot',
            excludeFromExport: true 
        });
        canvas.add(measureSnapDot);
    }
    
    // THE VISUAL FIX: Added 'visible: true' so it un-hides when starting a new measure!
    measureSnapDot.set({ 
        left: snapPt.x, 
        top: snapPt.y,
        radius: snapData.isSnapped ? 6 : 3,
        fill: snapData.isSnapped ? '#000000' : '#cccccc',
        stroke: snapData.isSnapped ? '#ffffff' : 'transparent',
        strokeWidth: snapData.isSnapped ? 2 : 0,
        visible: true 
    });
    
    canvas.bringToFront(measureSnapDot);

    // Update the temporary dashed line and HUD text if actively dragging
    if (measureState === 1 && measureStartPt && measureTempLine && measureTextObj) {
        
        measureTempLine.set({ x2: snapPt.x, y2: snapPt.y });

        const distPx = Math.hypot(snapPt.x - measureStartPt.x, snapPt.y - measureStartPt.y);
        const distFt = (distPx / 10).toFixed(2) + "'";

        const midX = (measureStartPt.x + snapPt.x) / 2;
        const midY = (measureStartPt.y + snapPt.y) / 2;
        let angle = Math.atan2(snapPt.y - measureStartPt.y, snapPt.x - measureStartPt.x) * 180 / Math.PI;
        if (angle > 90 || angle < -90) angle += 180;

        const perpAngle = angle - 90;
        const offsetDist = 15;
        const rad = perpAngle * Math.PI / 180;

        measureTextObj.set({
            text: distFt,
            left: midX + Math.cos(rad) * offsetDist,
            top: midY + Math.sin(rad) * offsetDist,
            angle: angle
        });
        
        canvas.bringToFront(measureTempLine);
        canvas.bringToFront(measureTextObj);
    }
    
    canvas.requestRenderAll();
});

canvas.on('mouse:down', (opt) => {
    if (currentTool !== 'measure') return;

    const pointer = canvas.getPointer(opt.e);
    const snapData = getMeasureSnapPoint(pointer);
    const snapPt = snapData.pt;

    if (measureState === 0 || measureState === 2) {
        resetMeasureTool();
        measureStartPt = snapPt;
        measureState = 1;

        measureTempLine = new fabric.Line([snapPt.x, snapPt.y, snapPt.x, snapPt.y], {
            stroke: '#000000', strokeWidth: 2, strokeDashArray: [5, 5],
            selectable: false, evented: false,
            excludeFromExport: true
        });
        canvas.add(measureTempLine);

        measureTextObj = new fabric.Text("0.00'", {
            fontSize: 14, fontFamily: 'helvetica',
            fill: '#000000', fontWeight: 'bold',
            originX: 'center', originY: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            selectable: false, evented: false,
            excludeFromExport: true
        });
        canvas.add(measureTextObj);
        
        if(measureSnapDot) canvas.bringToFront(measureSnapDot);

    } else if (measureState === 1) {
        measureState = 2; 
        if (measureSnapDot) measureSnapDot.set('visible', false); 
        canvas.requestRenderAll();
    }
});