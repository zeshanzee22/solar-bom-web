const DrawStructuralTop = {
    draw: function() {
        try {
            // --- 1. SETUP & DATA READ ---
            const rawData = localStorage.getItem('solarBOMData');
            if(!rawData) return '<h3 style="text-align:center;">No Data Found</h3>';
            const data = JSON.parse(rawData);

            const SCALE = 10;
            const C = {
                PANEL_FILL: "rgba(44, 123, 229, 0.2)", 
                PANEL_STROKE: "#000000",
                RAFTER: "#ffc022",
                PURLIN: "#6d6e70",
                COLUMN: "#ff5a48",
                WALKWAY: "#50C878", 
                STROKE: "#000000"
            };

            const isLandscape = (data.Orient || "").toLowerCase() === "landscape";
            const finalRafLen = parseFloat(data.FinalRafLen);
            const finalPurLen = parseFloat(data.FinalPurLen);

            const rowsNS = parseInt(data.PVQtyNS) || 1;
            const colsEW = parseInt(data.PVQtyEW) || 1;
            const rawPL = parseFloat(data.PL);
            const rawPW = parseFloat(data.PW);
            const stepNS = isLandscape ? rawPW : rawPL; 
            const stepEW = isLandscape ? rawPL : rawPW;
            const gapNS = parseFloat(data.PVGapNS) || 0.01;
            const gapEW = parseFloat(data.PVGapEW) || 0.01;
            const walkways = Array.isArray(data.walkwayList) ? data.walkwayList : [];

            // --- 2. GRID CALCULATION ---
            const getIndex = (w) => {
                if(w.afterIndex !== undefined) return parseInt(w.afterIndex);
                if(w.index !== undefined) return parseInt(w.index);
                return -1;
            };
            const isRowSplit = (w) => (w.type || "").toLowerCase().match(/horizontal|row|n-s/);
            const isColSplit = (w) => (w.type || "").toLowerCase().match(/vertical|col|e-w/);

            // Panel Grid (Centered)
            let rowY = [0], curY = 0;
            for(let r=1; r<rowsNS; r++) {
                curY += stepNS;
                let ww = walkways.find(w => isRowSplit(w) && getIndex(w) === r);
                curY += (ww ? parseFloat(ww.size) : gapNS);
                rowY.push(curY);
            }
            const arrayH = curY + stepNS;

            let colX = [0], curX = 0;
            for(let c=1; c<colsEW; c++) {
                curX += stepEW;
                let ww = walkways.find(w => isColSplit(w) && getIndex(w) === c);
                curX += (ww ? parseFloat(ww.size) : gapEW);
                colX.push(curX);
            }
            const arrayW = curX + stepEW;
            const offY = -arrayH / 2;
            const offX = -arrayW / 2;

            // Structure Params
            const colQtyEW = parseInt(data.ColQtyEW) || 2;
            const colQtyNS = parseInt(data.ColQtyNS) || 2;
            const spacingEW = parseFloat(data.PtoPEW);
            const spacingNS = parseFloat(data.PtoPNS);

            const colGridW = (colQtyEW - 1) * spacingEW;
            const colGridH = (colQtyNS - 1) * spacingNS;
            const colStartX = -colGridW / 2;
            const colStartY = -colGridH / 2;

            let colCoordsX = [];
            let colCoordsY = [];
            for(let i=0; i<colQtyEW; i++) colCoordsX.push((colStartX + (i * spacingEW)) * SCALE);
            for(let j=0; j<colQtyNS; j++) colCoordsY.push((colStartY + (j * spacingNS)) * SCALE);

            // --- DRAW RECT HELPER (With ID support) ---
            const drawRect = (x, y, w, h, fill, stroke=C.STROKE, sw=0.20, id="", cls="") => {
                return `<rect id="${id}" class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
            };

            // --- VIEWBOX SETUP ---
            let structVisualW = isLandscape ? finalRafLen : finalPurLen;
            let structVisualH = isLandscape ? finalPurLen : finalRafLen;
            const totalW = Math.max(arrayW, structVisualW);
            const totalH = Math.max(arrayH, structVisualH);
            
            const contentLeft = -(totalW * SCALE) / 2;
            const contentTop = -(totalH * SCALE) / 2;
            const vbMinX = contentLeft - 180; 
            const vbMinY = contentTop - 75;
            const vbWidth = (totalW * SCALE) + 250; 
            const vbHeight = (totalH * SCALE) + 200; 

            const compassX = vbMinX + 60; 
            const compassY = contentTop + (totalH * SCALE) + 80; 

            // Initialize SVG
            let svg = "";
            if (typeof DrawUtils !== 'undefined') {
                svg = DrawUtils.createSVG("structTopSVG", `${vbMinX} ${vbMinY} ${vbWidth} ${vbHeight}`);
            } else {
                // Fallback if DrawUtils is missing
                svg = `<svg id="structTopSVG" viewBox="${vbMinX} ${vbMinY} ${vbWidth} ${vbHeight}" xmlns="http://www.w3.org/2000/svg">`;
            }

            // --- 3. LAYERS ---
            
            // A. COLUMNS
            const colSize = 0.6 * SCALE;
            for(let i=0; i<colQtyEW; i++) {
                for(let j=0; j<colQtyNS; j++) {
                    svg += drawRect(colCoordsX[i] - colSize/2, colCoordsY[j] - colSize/2, colSize, colSize, C.COLUMN);
                }
            }

            // B. RAFTERS (Yellow)
            const rafThick = (isLandscape ? 0.3 : 0.25) * SCALE;
            if (isLandscape) {
                const rW = finalRafLen * SCALE;
                for(let j=0; j<colQtyNS; j++) svg += drawRect(-rW/2, colCoordsY[j] - rafThick/2, rW, rafThick, C.RAFTER);
            } else {
                const rH = finalRafLen * SCALE;
                for(let i=0; i<colQtyEW; i++) svg += drawRect(colCoordsX[i] - rafThick/2, -rH/2, rafThick, rH, C.RAFTER);
            }

            // C. PURLINS (Grey)
            const purThick = 0.15 * SCALE;
            const PVhole = parseFloat(data.PVhole) || 0;
            
            if (isLandscape) {
                const pH = finalPurLen * SCALE;
                const holeOffset = (PVhole > 0 && PVhole < stepEW) ? (stepEW - PVhole) / 2 : stepEW * 0.2;

                for(let c=0; c<colsEW; c++) {
                    let pLeftX = offX + colX[c]; 
                    // Purlin 1 & 2
                    svg += drawRect((pLeftX + holeOffset) * SCALE - purThick/2, -pH/2, purThick, pH, C.PURLIN);
                    svg += drawRect((pLeftX + stepEW - holeOffset) * SCALE - purThick/2, -pH/2, purThick, pH, C.PURLIN);
                }
            } else {
                const pW = finalPurLen * SCALE;
                const holeOffset = (PVhole > 0 && PVhole < stepNS) ? (stepNS - PVhole) / 2 : stepNS * 0.2;

                for(let r=0; r<rowsNS; r++) {
                    let pTopY = offY + rowY[r];
                    // Purlin 1 & 2
                    svg += drawRect(-pW/2, (pTopY + holeOffset) * SCALE - purThick/2, pW, purThick, C.PURLIN);
                    svg += drawRect(-pW/2, (pTopY + stepNS - holeOffset) * SCALE - purThick/2, pW, purThick, C.PURLIN);
                }
            }

            // D. WALKWAYS
            walkways.forEach(ww => {
                let sz = parseFloat(ww.size);
                let idx = getIndex(ww);
                if(isRowSplit(ww) && idx > 0 && idx < rowsNS) svg += drawRect(offX*SCALE, (offY + rowY[idx-1] + stepNS) * SCALE, arrayW*SCALE, sz*SCALE, C.WALKWAY);
                if(isColSplit(ww) && idx > 0 && idx < colsEW) svg += drawRect((offX + colX[idx-1] + stepEW) * SCALE, offY*SCALE, sz*SCALE, arrayH*SCALE, C.WALKWAY);
            });

            // E. PANELS (The Clickable Layer)
            for(let r=0; r<rowsNS; r++) {
                for(let c=0; c<colsEW; c++) {
                    const pID = `p-${r}-${c}`;
                    
                    // CHECK GLOBAL MEMORY
                    let isHidden = window.solarAirPockets && window.solarAirPockets.has(pID);
                    
                    // Logic: If hidden, gray/0.1. If visible, use the semi-transparent Blue from config.
                    let finalFill = isHidden ? "#cccccc" : C.PANEL_FILL;
                    let finalOpacity = isHidden ? "0.1" : "1";

                    svg += `<rect id="${pID}" class="clickable-panel" x="${(offX + colX[c])*SCALE}" y="${(offY + rowY[r])*SCALE}" width="${stepEW*SCALE}" height="${stepNS*SCALE}" fill="${finalFill}" fill-opacity="${finalOpacity}" stroke="${C.PANEL_STROKE}" stroke-width="0.25" />`;
                }
            }
            // --- 4. COMPASS ---
            if(typeof DrawUtils !== 'undefined' && DrawUtils.drawCompass) {
                svg += DrawUtils.drawCompass(compassX, compassY);
            }

            svg += `</svg>`;
            return svg;

        } catch(e) { 
            console.error(e);
            return `<h3 style='color:red;'>Error: ${e.message}</h3>`; 
        }
    } // <-- THIS CLOSING BRACE WAS LIKELY MISSING
}; // <-- THIS OBJECT CLOSURE WAS LIKELY MISSING