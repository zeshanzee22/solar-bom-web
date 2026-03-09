// dimline.js
// Handles Architectural Dimension Lines (Tick Style)

function addDimensionLine(canvas, start, end, textVal, offset = 30, isVert = false) {
    const dimColor = "#555"; // Darker, sleeker Grey
    
    // 1. CUTE SLASHES: Reduced from 5 to 2.5 (Fixes the "barbwire" look)
    const tickSize = 2.5;      
    
    // 2. TIGHTEN UP: Scale the offset by 50% so dimensions hug the array much closer!
    offset = offset * 0.5;

    let p1 = { x: start.x, y: start.y };
    let p2 = { x: end.x, y: end.y };

    // Apply Offset (Push line away from object)
    if (isVert) {
        p1.x += offset;
        p2.x += offset;
    } else {
        p1.y += offset;
        p2.y += offset;
    }

    const objs = [];

    // Directional overshoot so extension lines look like real blueprints
    const extSign = offset > 0 ? 1 : -1;
    const extLen = 4 * extSign; 

    // Extension Lines
    if (isVert) {
        objs.push(new fabric.Line([start.x, start.y, p1.x + extLen, p1.y], { stroke: dimColor, strokeWidth: 0.5, isDimension: true }));
        objs.push(new fabric.Line([end.x, end.y, p2.x + extLen, p2.y], { stroke: dimColor, strokeWidth: 0.5, isDimension: true }));
    } else {
        objs.push(new fabric.Line([start.x, start.y, p1.x, p1.y + extLen], { stroke: dimColor, strokeWidth: 0.5, isDimension: true }));
        objs.push(new fabric.Line([end.x, end.y, p2.x, p2.y + extLen], { stroke: dimColor, strokeWidth: 0.5, isDimension: true }));
    }

    // Main Dimension Line
    objs.push(new fabric.Line([p1.x, p1.y, p2.x, p2.y], { stroke: dimColor, strokeWidth: 1, isDimension: true }));

    // Architectural Ticks (Diagonal Slashes)
    function drawTick(pt) {
        return new fabric.Line([pt.x - tickSize, pt.y - tickSize, pt.x + tickSize, pt.y + tickSize], {
            stroke: dimColor,
            strokeWidth: 1.5,
            originX: 'center',
            originY: 'center',
            isDimension: true 
        });
    }
    objs.push(drawTick(p1));
    objs.push(drawTick(p2));

    // 3. SMART TEXT: No background, semi-bold!
    const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    
    const textObj = new fabric.Text(textVal, {
        fontSize: 11,
        fontFamily: 'helvetica',
        fontWeight: '600', // Semi-bold (less aggressive than the roof layout bold)
        fill: '#444',
        backgroundColor: 'transparent', // NO MORE STICKER!
        originX: 'center',
        originY: 'center',
        left: center.x,
        top: center.y,
        isDimension: true 
    });
    
    // Float the text slightly off the line so it doesn't intersect, eliminating the need for a background
    if(isVert) {
        textObj.angle = -90;
        textObj.left += (offset > 0 ? 10 : -10); 
    } else {
        textObj.top += (offset > 0 ? 10 : -10); 
    }

    objs.push(textObj);

    return objs; 
}

// Helper to convert pixels to the chosen Layout Unit
function formatDim(px) {
    const totalFt = px / 10; // 10px = 1ft
    const unitState = document.getElementById('layout-unit') ? document.getElementById('layout-unit').value : 'ft-dec';

    if (unitState === 'ft-dec') return `${totalFt.toFixed(2)}'`;
    
    if (unitState === 'ft-in') {
        const ft = Math.floor(totalFt);
        const inch = Math.round((totalFt - ft) * 12);
        return `${ft}' ${inch}"`;
    }
    
    if (unitState === 'in') return `${(totalFt * 12).toFixed(1)}"`;
    if (unitState === 'mm') return `${(totalFt * 304.8).toFixed(0)} mm`;
    if (unitState === 'cm') return `${(totalFt * 30.48).toFixed(1)} cm`;
    if (unitState === 'm')  return `${(totalFt * 0.3048).toFixed(2)} m`;

    return `${totalFt.toFixed(2)}'`;
}