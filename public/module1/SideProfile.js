const SideProfile = {
    draw: function() {
        try {
            // --- 1. SETUP & DATA ---
            const rawData = localStorage.getItem('solarBOMData');
            if(!rawData) return '<h3 style="text-align:center;">No Data Found</h3>';
            const data = JSON.parse(rawData);
            
            const SCALE = 10; 
            const C = {
                PANEL: "#2C7BE5",
                PURLIN: "#6d6e70",
                RAFTER: "#ffc022",
                COLUMN: "#ff5a48",
                WALKWAY: "#50C878",
                GROUND: "#300b08",
                DIM: "#000000",
                STROKE: "#000000",
                DIM_LINE: "#555555"
            };

            // Inputs
            const isLandscape = (data.Orient || "").toLowerCase() === "landscape";
            const tilt = parseFloat(data.TiltA) || 0;
            const rads = tilt * (Math.PI / 180);
            
            const rawPL = parseFloat(data.PL);
            const rawPW = parseFloat(data.PW);
            const panelDim = isLandscape ? rawPW : rawPL; 
            
            const rowsNS = parseInt(data.PVQtyNS) || 1;
            const gapNS = parseFloat(data.PVGapNS) || 0.01;

            // HOLE CONFIG
            const pvHole = parseFloat(data.PVhole) || 4.59; 
            const purH = parseFloat(data.PurH) || 0.25;
            const purW = parseFloat(data.PurW) || 0.15;
            
            let purlinOffset = 0;
            const dimensionForHoles = isLandscape ? rawPW : rawPL;
            
            if (pvHole > 0 && pvHole < dimensionForHoles) {
                purlinOffset = (dimensionForHoles - pvHole) / 2;
            } else {
                purlinOffset = dimensionForHoles * 0.2;
            }
            
            const walkways = Array.isArray(data.walkwayList) ? data.walkwayList : [];
            const isRowSplit = (w) => (w.type || "").toLowerCase().match(/horizontal|row|n-s/);
            const getIndex = (w) => {
                if(w.afterIndex !== undefined) return parseInt(w.afterIndex);
                if(w.index !== undefined) return parseInt(w.index);
                return -1;
            };

            const rafH = parseFloat(data.RafH) || 0.5;
            const rafW = parseFloat(data.RafW) || 0.25;

            // --- COLUMN DIMENSIONS ---
            // Swapping logic: Use Height for Portrait, Width for Landscape
const colW_val = parseFloat(data.ColW) || 0.3;
const colH_val = parseFloat(data.ColH) || 0.5;
const drawColThick = isLandscape ? colW_val : colH_val;
            const sfh = parseFloat(data.SFH); 
const sbh = parseFloat(data.SBH); 

// --- GET CUSTOM CANTILEVERS (Bulletproof) ---
// We removed the fallback so the back can NEVER copy the front value.
const frontCLNS = data.frontCLNS !== undefined ? Number(data.frontCLNS) : 0;
const backCLNS = data.backCLNS !== undefined ? Number(data.backCLNS) : 0;

            
            const colQtyNS = parseInt(data.ColQtyNS);
            const spacingNS = parseFloat(data.PtoPNS); // Horizontal Spacing
            const poleHeights = data.poleData || [];


            // --- 2. CANVAS ORIGIN & GROUND ---
            const pad = 10 * SCALE;
            const groundY = 40 * SCALE;
            
            const totalHoriSpan = (colQtyNS - 1) * spacingNS;
            const startX = 15 * SCALE; 
            const frontPoleX = startX + (totalHoriSpan * SCALE) + pad; 
            
            // --- 3. CALCULATE POLE TOPS ---
            const frontPoleH = poleHeights.length > 0 ? poleHeights[0].val : sfh;
            const frontTop = { x: frontPoleX, y: groundY - (frontPoleH * SCALE) };
            
            const backPoleH = poleHeights.length > 0 ? poleHeights[poleHeights.length-1].val : sbh;
            const backPoleX = frontPoleX - (totalHoriSpan * SCALE);
            const backTop = { x: backPoleX, y: groundY - (backPoleH * SCALE) };
            
            // --- 4. FIND CENTER ---
            const midX = (frontTop.x + backTop.x) / 2;
            const midY = (frontTop.y + backTop.y) / 2;
            
            // --- 5. RAFTER GEOMETRY ---
            let drawRafLen = 0;
            
            let stack = [];
            let cursor = 0;
            const panelThick = 0.15;
            const walkwayThick = 0.35; // New specific height for walkways

            for(let r=1; r<=rowsNS; r++) {
                stack.push({ type: 'panel', start: cursor, len: panelDim });
                stack.push({ type: 'purlin_node', pos: cursor + purlinOffset });
                stack.push({ type: 'purlin_node', pos: cursor + panelDim - purlinOffset });
                cursor += panelDim;
                if(r < rowsNS) {
                    let ww = walkways.find(w => isRowSplit(w) && getIndex(w) === r);
                    if(ww) {
                        let sz = parseFloat(ww.size);
                        stack.push({ type: 'walkway', start: cursor, len: sz });
                        cursor += sz;
                    } else {
                        cursor += gapNS;
                    }
                }
            }
            const slopeLen = cursor;

            if(!isLandscape && data.FinalRafLen) {
                drawRafLen = parseFloat(data.FinalRafLen);
            } else {
                drawRafLen = slopeLen;
            }

            // --- 6. COORDINATE SYSTEM ---
            const getGlobal = (localX, localY) => {
                const cos = Math.cos(rads);
                const sin = Math.sin(rads);
                const rx = (localX * cos) - (localY * sin);
                const ry = (localX * sin) + (localY * cos);
                return { x: midX + rx, y: midY + ry };
            };

            const drawPoly = (pts, color) => {
                return `<polygon points="${pts.map(p=>`${p.x},${p.y}`).join(' ')}" fill="${color}" stroke="${C.STROKE}" stroke-width="0.15" />`;
            };

            const getRectPts = (lx, ly, w, h) => {
                return [
                    getGlobal(lx, ly),
                    getGlobal(lx + w, ly),
                    getGlobal(lx + w, ly + h),
                    getGlobal(lx, ly + h)
                ];
            };
            
            // --- FIXED ASYMMETRIC COORDINATE SYSTEM ---
            const totalPoleSpanSlope = totalHoriSpan / Math.cos(rads);
            const halfSpan = totalPoleSpanSlope / 2;

            // 1. Calculate how much the entire array shifts off-center based on cantilevers
            const centerShift = (frontCLNS - backCLNS) / 2;

            // 2. Shift the Panels exactly as before but keeping their true array length
            const halfArray = slopeLen / 2;
            const panelFrontLocalX = centerShift + halfArray;
            const panelBackLocalX = centerShift - halfArray;

            // 3. Shift the Rafter AND restore the proper 'drawRafLen' (Fixes missing cut mode tolerances)
            const halfRaf = drawRafLen / 2;
            const rafFrontLocalX = centerShift + halfRaf;
            const rafBackLocalX = centerShift - halfRaf;
            const actualRafLen = drawRafLen;

            // --- 7. VIEWBOX ---
            const globalBackTip = getGlobal(Math.min(rafBackLocalX, panelBackLocalX) * SCALE, 0);
            const globalFrontTip = getGlobal(Math.max(rafFrontLocalX, panelFrontLocalX) * SCALE, 0);

            const rafY = -rafH * SCALE;
            const purY = rafY - (purH * SCALE);
            const panBodyY = purY - (panelThick * SCALE);
            
            // Adjust Viewbox Top to fit new dimensions ABOVE the rafter
            const topDimLocalY = rafY - (purH * SCALE) - (panelThick * SCALE) - (8 * SCALE); 
            const topBack = getGlobal(rafBackLocalX * SCALE, topDimLocalY);
            const topFront = getGlobal(rafFrontLocalX * SCALE, topDimLocalY);
            const minGy = Math.min(topBack.y, topFront.y, globalBackTip.y, globalFrontTip.y);
            
            // ZOOM FIX: Reduced padding from 15 to 5 to zoom in
            const padX = 25 * SCALE;
            const padY = 15 * SCALE;

            const vbLeft = globalBackTip.x - padX;
            const vbRight = globalFrontTip.x + padX; 
            const vbTop = minGy - padY;
            const vbBottom = groundY + padY;
            
            let svg = DrawUtils.createSVG("sideProfileSVG", `${vbLeft} ${vbTop} ${vbRight - vbLeft} ${vbBottom - vbTop}`);


            // --- DIMENSION HELPERS ---
            const drawVertDim = (targetX, targetY, groundYLevel, offsetX, text, isBold = false) => {
                const dimX = targetX + offsetX;
                let s = `<line x1="${targetX}" y1="${targetY}" x2="${dimX}" y2="${targetY}" stroke="${C.DIM_LINE}" stroke-width="0.5" />`; 
                s += `<line x1="${targetX}" y1="${groundYLevel}" x2="${dimX}" y2="${groundYLevel}" stroke="${C.DIM_LINE}" stroke-width="0.5" />`; 
                s += `<line x1="${dimX}" y1="${targetY}" x2="${dimX}" y2="${groundYLevel}" stroke="${C.DIM}" stroke-width="0.5" />`; 
                
                const t = 3;
                s += `<line x1="${dimX-t}" y1="${targetY+t}" x2="${dimX+t}" y2="${targetY-t}" stroke="${C.DIM}" stroke-width="1" />`;
                s += `<line x1="${dimX-t}" y1="${groundYLevel+t}" x2="${dimX+t}" y2="${groundYLevel-t}" stroke="${C.DIM}" stroke-width="1" />`;
                
                const midY = (targetY + groundYLevel) / 2;
                const textX = offsetX > 0 ? dimX + 5 : dimX - 5;
                const anchor = offsetX > 0 ? "start" : "end";
                const weight = isBold ? "bold" : "normal";
                s += `<text x="${textX}" y="${midY}" text-anchor="${anchor}" dominant-baseline="middle" font-family="Arial" font-size="12" font-weight="${weight}" fill="${C.DIM}">${text}</text>`;
                return s;
            };

            const drawHoriDim = (x1, x2, yLevel, text) => {
                let s = `<line x1="${x1}" y1="${yLevel}" x2="${x2}" y2="${yLevel}" stroke="${C.DIM}" stroke-width="0.5" />`;
                s += `<line x1="${x1}" y1="${groundY}" x2="${x1}" y2="${yLevel}" stroke="${C.DIM_LINE}" stroke-width="0.5" />`;
                s += `<line x1="${x2}" y1="${groundY}" x2="${x2}" y2="${yLevel}" stroke="${C.DIM_LINE}" stroke-width="0.5" />`;
                
                const t = 3;
                s += `<line x1="${x1-t}" y1="${yLevel+t}" x2="${x1+t}" y2="${yLevel-t}" stroke="${C.DIM}" stroke-width="1" />`;
                s += `<line x1="${x2-t}" y1="${yLevel+t}" x2="${x2+t}" y2="${yLevel-t}" stroke="${C.DIM}" stroke-width="1" />`;
                
                const midX = (x1 + x2) / 2;
                s += `<text x="${midX}" y="${yLevel - 5}" text-anchor="middle" font-family="Arial" font-size="12" fill="${C.DIM}">${text}</text>`;
                return s;
            };

            const drawRotatedDim = (p1, p2, offset, text) => {
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const angle = Math.atan2(dy, dx);
                
                const perpX = -Math.sin(angle);
                const perpY = Math.cos(angle);

                const d1 = { x: p1.x + perpX * offset, y: p1.y + perpY * offset };
                const d2 = { x: p2.x + perpX * offset, y: p2.y + perpY * offset };

                let s = "";
                s += `<line x1="${p1.x}" y1="${p1.y}" x2="${d1.x}" y2="${d1.y}" stroke="${C.DIM_LINE}" stroke-width="0.5" />`;
                s += `<line x1="${p2.x}" y1="${p2.y}" x2="${d2.x}" y2="${d2.y}" stroke="${C.DIM_LINE}" stroke-width="0.5" />`;
                s += `<line x1="${d1.x}" y1="${d1.y}" x2="${d2.x}" y2="${d2.y}" stroke="${C.DIM}" stroke-width="0.5" />`;

                const tickLen = 3;
                const tickAngle = angle + Math.PI / 4;
                const tx = Math.cos(tickAngle) * tickLen;
                const ty = Math.sin(tickAngle) * tickLen;
                s += `<line x1="${d1.x - tx}" y1="${d1.y - ty}" x2="${d1.x + tx}" y2="${d1.y + ty}" stroke="${C.DIM}" stroke-width="1" />`;
                s += `<line x1="${d2.x - tx}" y1="${d2.y - ty}" x2="${d2.x + tx}" y2="${d2.y + ty}" stroke="${C.DIM}" stroke-width="1" />`;

                const midX = (d1.x + d2.x) / 2;
                const midY = (d1.y + d2.y) / 2;
                const textGap = 8;
                const textX = midX + perpX * (offset > 0 ? textGap : -textGap);
                const textY = midY + perpY * (offset > 0 ? textGap : -textGap);
                
                let textRot = angle * (180 / Math.PI);
                if (textRot > 90 || textRot < -90) textRot += 180;

                s += `<text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="${C.DIM}" transform="rotate(${textRot}, ${textX}, ${textY})">${text}</text>`;
                return s;
            };

            // --- A. GROUND ---
            svg += `<line x1="${vbLeft}" y1="${groundY}" x2="${vbRight}" y2="${groundY}" stroke="${C.GROUND}" stroke-width="3" />`;

         // --- B. COLUMNS ---
            let colXMap = [];
            
            // 1. FIRST LOOP: Draw all the physical columns (Lower Layer)
            for(let i=0; i<colQtyNS; i++) {
                let h = (poleHeights[i] ? poleHeights[i].val : sfh);
                let cx = frontPoleX - (i * spacingNS * SCALE);
                let cy = groundY - (h * SCALE);
                
                svg += `<rect x="${cx - (drawColThick*SCALE)/2}" y="${cy}" width="${drawColThick*SCALE}" height="${h*SCALE}" fill="${C.COLUMN}" stroke="${C.STROKE}" stroke-width="0.25" />`;
                colXMap.push(cx);
            }

            // 2. SECOND LOOP: Draw all the height dimensions (Upper Layer)
            for(let i=0; i<colQtyNS; i++) {
                let h = (poleHeights[i] ? poleHeights[i].val : sfh);
                let cx = colXMap[i];
                let cy = groundY - (h * SCALE);
                
                // Reduced the offset from -3*SCALE to -1.5*SCALE so it stays closer to the pole
                svg += drawVertDim(cx - (drawColThick*SCALE)/2, cy, groundY, -1.5*SCALE, h.toFixed(2)+"'");
            }
            
            // Spacing Dims
            for(let i=0; i<colQtyNS-1; i++) {
                svg += drawHoriDim(colXMap[i+1], colXMap[i], groundY + (4*SCALE), spacingNS.toFixed(2)+"'");
            }

            // --- C. STRUCTURE LAYERS ---
            // 1. Rafter
if(!isLandscape) {
    svg += drawPoly(getRectPts(rafBackLocalX * SCALE, rafY, actualRafLen*SCALE, rafH*SCALE), C.RAFTER);
} else {
                const slopeStep = totalPoleSpanSlope / (colQtyNS - 1);
                for(let i=0; i<colQtyNS; i++) {
                    let rx = halfSpan - (i * slopeStep); 
                    svg += drawPoly(getRectPts((rx * SCALE) - (rafW*SCALE)/2, rafY, rafW*SCALE, rafH*SCALE), C.RAFTER);
                }
            }

            // 2. Purlins
            stack.forEach(item => {
                if(item.type === 'purlin_node') {
                    let centerPos = panelBackLocalX + item.pos;
                    let startPos = centerPos - (purW / 2);
                    svg += drawPoly(getRectPts(startPos * SCALE, purY, purW*SCALE, purH*SCALE), C.PURLIN);
                }
            });

            // 3. Panels
            if(isLandscape) {
                 svg += drawPoly(getRectPts(panelBackLocalX * SCALE, purY, slopeLen*SCALE, purH*SCALE), C.PURLIN);
            }
            stack.forEach(item => {
    let px = panelBackLocalX + item.start;
    if(item.type === 'panel') {
        svg += drawPoly(getRectPts(px*SCALE, panBodyY, item.len*SCALE, panelThick*SCALE), C.PANEL);
    } else if(item.type === 'walkway') {
        // Change panelThick*SCALE to walkwayThick*SCALE here:
        svg += drawPoly(getRectPts(px*SCALE, panBodyY, item.len*SCALE, walkwayThick*SCALE), C.WALKWAY);
    }
});

            // --- GLOBAL DIMS ---
            const tipFront = getGlobal(panelFrontLocalX * SCALE, panBodyY + (panelThick*SCALE));
            svg += drawVertDim(tipFront.x, tipFront.y, groundY, 6*SCALE, sfh.toFixed(2)+"'", true);

            const tipBack = getGlobal(panelBackLocalX * SCALE, panBodyY + (panelThick*SCALE));
            svg += drawVertDim(tipBack.x, tipBack.y, groundY, -6*SCALE, sbh.toFixed(2)+"'", true);

            // --- ROTATED DIMENSIONS (FIXED SCOPE) ---
            
            // 1. Define the points globally so all steps can use them
            const pFrontPole = getGlobal(halfSpan * SCALE, rafY);
            const pRafFront = getGlobal(rafFrontLocalX * SCALE, rafY);
            const pRafBack = getGlobal(rafBackLocalX * SCALE, rafY);
            const pBackPole = getGlobal(-halfSpan * SCALE, rafY);

            // 2. Front Cantilever (Only draw if greater than 0)
            if (frontCLNS > 0) {
                svg += drawRotatedDim(pFrontPole, pRafFront, -5*SCALE, frontCLNS.toFixed(2)+"'");
            }

            // 3. Back Cantilever (Only draw if greater than 0)
            if (backCLNS > 0) {
                svg += drawRotatedDim(pRafBack, pBackPole, -5*SCALE, backCLNS.toFixed(2)+"'");
            }

            // 4. Rafter Dimension
            // Ensure this is above the cantilevers
            const rafDimOffset = -(purH*SCALE + panelThick*SCALE + 8*SCALE); 
            let rafterDimText = "";
            if (isLandscape) {
                rafterDimText = (parseFloat(data.FinalPurLen) || slopeLen).toFixed(2) + "'";
            } else {
                rafterDimText = (parseFloat(data.FinalRafLen) || drawRafLen).toFixed(2) + "'";
            }
            // Now this step can successfully see pRafBack and pRafFront!
            svg += drawRotatedDim(pRafBack, pRafFront, rafDimOffset, rafterDimText);


            // Angle
            const arcR = 8 * SCALE;
            const arcCx = tipBack.x;
            const arcCy = tipBack.y;
            const endX = arcCx + (arcR * Math.cos(rads));
            const endY = arcCy + (arcR * Math.sin(rads));
            svg += `<path d="M ${arcCx + arcR} ${arcCy} A ${arcR} ${arcR} 0 0 1 ${endX} ${endY}" fill="none" stroke="${C.DIM}" stroke-width="1.5" />`;
            svg += `<line x1="${arcCx}" y1="${arcCy}" x2="${arcCx + arcR + 20}" y2="${arcCy}" stroke="${C.DIM_LINE}" stroke-width="1" stroke-dasharray="4,2"/>`;
            const halfRads = rads / 2;
            const tx = arcCx + ((arcR+3*SCALE) * Math.cos(halfRads));
            const ty = arcCy + ((arcR+3*SCALE) * Math.sin(halfRads));
            svg += `<text x="${tx}" y="${ty}" dominant-baseline="middle" font-family="Arial" font-size="16" font-weight="bold">${tilt}°</text>`;

// --- COMPASS (Bottom Left: N --> S) ---
            // Position relative to ViewBox Bottom-Left
            const compX = vbLeft + (1 * SCALE);
            const compY = vbBottom - (3 * SCALE);

            svg += `<g transform="translate(${compX}, ${compY})">`;
            // 'N' Label
            svg += `<text x="0" y="5" font-family="Arial" font-size="14" font-weight="bold" fill="black">N</text>`;
            // Arrow Shaft
            svg += `<line x1="15" y1="0" x2="80" y2="0" stroke="black" stroke-width="1.5" />`;
            // Arrowhead
            svg += `<polygon points="80,-3 90,0 80,3" fill="black" />`;
            // 'S' Label
            svg += `<text x="95" y="5" font-family="Arial" font-size="14" font-weight="bold" fill="black">S</text>`;
            svg += `</g>`;

            svg += `</svg>`;
            return svg;
        } catch(e) {
            console.error(e);
            return `<h3 style='color:red;'>Error: ${e.message}</h3>`;
        }
    }
};