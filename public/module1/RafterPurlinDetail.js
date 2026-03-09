const DrawRafterPurlin = {
    draw: function() {
        try {
            // --- 1. SETUP ---
            const rawData = localStorage.getItem('solarBOMData');
            if(!rawData) return '<h3 style="text-align:center;">No Data Found</h3>';
            const data = JSON.parse(rawData);

            const SCALE = 10;
            const C = {
                RAFTER: "#ffc022",
                PURLIN: "#6d6e70",
                COLUMN: "#ff5a48",
                DIM: "#000000",
                STROKE: "#000000"
            };

            const isLandscape = (data.Orient || "").toLowerCase() === "landscape";
            const finalRafLen = parseFloat(data.FinalRafLen);
            const finalPurLen = parseFloat(data.FinalPurLen);

            const colQtyEW = parseInt(data.ColQtyEW) || 2;
            const colQtyNS = parseInt(data.ColQtyNS) || 2;
            const spacingEW = parseFloat(data.PtoPEW);
            const spacingNS = parseFloat(data.PtoPNS);

            // Panel & Walkway Data
            const rowsNS = parseInt(data.PVQtyNS) || 1;
            const colsEW = parseInt(data.PVQtyEW) || 1;
            const rawPL = parseFloat(data.PL);
            const rawPW = parseFloat(data.PW);
            const stepNS = isLandscape ? rawPW : rawPL; 
            const stepEW = isLandscape ? rawPL : rawPW;
            const gapNS = parseFloat(data.PVGapNS) || 0.01;
            const gapEW = parseFloat(data.PVGapEW) || 0.01;
            const PVhole = parseFloat(data.PVhole) || 0;
            const walkways = Array.isArray(data.walkwayList) ? data.walkwayList : [];

            // --- 2. WALKWAY HELPERS ---
            const getIndex = (w) => {
                if(w.afterIndex !== undefined) return parseInt(w.afterIndex);
                if(w.index !== undefined) return parseInt(w.index);
                return -1;
            };
            const isRowSplit = (w) => (w.type || "").toLowerCase().match(/horizontal|row|n-s/);
            const isColSplit = (w) => (w.type || "").toLowerCase().match(/vertical|col|e-w/);

            // --- 3. CALCULATE EXACT GRID POSITIONS ---
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

           // --- 4. VIEWBOX SETUP (MATCHING REFERENCE) ---
            let dimHoriVal, dimVertVal;
            let labelHori, labelVert;

            if (isLandscape) {
                dimHoriVal = finalRafLen; 
                dimVertVal = finalPurLen;
                labelHori = "Rafter";
                labelVert = "Purlin";
            } else {
                dimHoriVal = finalPurLen;
                dimVertVal = finalRafLen;
                labelHori = "Purlin";
                labelVert = "Rafter";
            }

            const totalW = dimHoriVal;
            const totalH = dimVertVal;

            // 1. Establish Content Boundaries (Centered at 0,0)
            const contentLeft = -(totalW * SCALE) / 2;
            const contentTop = -(totalH * SCALE) / 2;
            const contentHeightPx = totalH * SCALE;

            // 2. ViewBox Limits (Apply Reference Margins: Left 180, Top 60)
            const vbMinX = contentLeft - 180;
            const vbMinY = contentTop - 75;
            const vbWidth = (totalW * SCALE) + 250; 
            
            // 3. Compass Position (Fixed relative to content, like PanelLayout)
            const compassX = contentLeft - 120;
            const compassY = contentTop + contentHeightPx + 80;

            const vbHeight = contentHeightPx + 200; // Height + Top(60) + Bottom(140)

            let svg = DrawUtils.createSVG("rafPurSVG", `${vbMinX} ${vbMinY} ${vbWidth} ${vbHeight}`);

            const drawRect = (x, y, w, h, fill) => {
                return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.STROKE}" stroke-width="0.25" />`;
            };

            const drawDim = (x1, y1, x2, y2, text, isVert) => {
                let s = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.DIM}" stroke-width="0.25" />`;
                const t = 4; 
                if(isVert) {
                    s += `<line x1="${x1-t}" y1="${y1+t}" x2="${x1+t}" y2="${y1-t}" stroke="${C.DIM}" stroke-width="0.8" />`;
                    s += `<line x1="${x2-t}" y1="${y2+t}" x2="${x2+t}" y2="${y2-t}" stroke="${C.DIM}" stroke-width="0.8" />`;
                    s += `<text x="${x1-8}" y="${(y1+y2)/2}" text-anchor="end" dominant-baseline="middle" font-family="Arial" font-size="12" font-weight="bold" fill="${C.DIM}">${text}</text>`;
                } else {
                    s += `<line x1="${x1-t}" y1="${y1+t}" x2="${x1+t}" y2="${y1-t}" stroke="${C.DIM}" stroke-width="0.8" />`;
                    s += `<line x1="${x2-t}" y1="${y2+t}" x2="${x2+t}" y2="${y2-t}" stroke="${C.DIM}" stroke-width="0.8" />`;
                    s += `<text x="${(x1+x2)/2}" y="${y1-8}" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="${C.DIM}">${text}</text>`;
                }
                return s;
            };

            // Structure Grid
            const colGridW = (colQtyEW - 1) * spacingEW;
            const colGridH = (colQtyNS - 1) * spacingNS;
            const colStartX = -colGridW / 2;
            const colStartY = -colGridH / 2;
            
            let colCoordsX = [];
            let colCoordsY = [];
            for(let i=0; i<colQtyEW; i++) colCoordsX.push((colStartX + (i * spacingEW)) * SCALE);
            for(let j=0; j<colQtyNS; j++) colCoordsY.push((colStartY + (j * spacingNS)) * SCALE);

            // --- 5. DRAWING LOGIC ---

            if (isLandscape) {
                // LANDSCAPE MODE
                const rafThick = 0.3 * SCALE;
                const purThick = 0.15 * SCALE;
                const rW = finalRafLen * SCALE;
                
                // Rafters (Horizontal)
                for(let j=0; j<colQtyNS; j++) {
                    svg += drawRect(-rW/2, colCoordsY[j] - rafThick/2, rW, rafThick, C.RAFTER);
                }
                
                // Purlins (Vertical)
                const pH = finalPurLen * SCALE;
                const holeOffset = (PVhole > 0 && PVhole < stepEW) ? (stepEW - PVhole) / 2 : stepEW * 0.2;

                for(let c=0; c<colsEW; c++) {
                    let pLeftX = offX + colX[c];
                    svg += drawRect((pLeftX + holeOffset) * SCALE - purThick/2, -pH/2, purThick, pH, C.PURLIN);
                    svg += drawRect((pLeftX + stepEW - holeOffset) * SCALE - purThick/2, -pH/2, purThick, pH, C.PURLIN);
                }

            } else {
                // PORTRAIT MODE
                const rafThick = 0.25 * SCALE;
                const purThick = 0.15 * SCALE;
                const rH = finalRafLen * SCALE;
                
                // Rafters (Vertical)
                for(let i=0; i<colQtyEW; i++) {
                    svg += drawRect(colCoordsX[i] - rafThick/2, -rH/2, rafThick, rH, C.RAFTER);
                }
                
                // Purlins (Horizontal)
                const pW = finalPurLen * SCALE;
                const holeOffset = (PVhole > 0 && PVhole < stepNS) ? (stepNS - PVhole) / 2 : stepNS * 0.2;

                for(let r=0; r<rowsNS; r++) {
                    let pTopY = offY + rowY[r];
                    svg += drawRect(-pW/2, (pTopY + holeOffset) * SCALE - purThick/2, pW, purThick, C.PURLIN);
                    svg += drawRect(-pW/2, (pTopY + stepNS - holeOffset) * SCALE - purThick/2, pW, purThick, C.PURLIN);
                }
            }

            // --- 6. DIMENSIONS ---
            
            const dimOffset = 4 * SCALE;
            const extPast = 0 * SCALE;

            // 1. Horizontal Dimension (Top)
            const objTop = -dimVertVal * SCALE / 2;
            const dimY = objTop - dimOffset;
            const hX1 = -dimHoriVal * SCALE / 2;
            const hX2 = dimHoriVal * SCALE / 2;

            svg += `<line x1="${hX1}" y1="${objTop}" x2="${hX1}" y2="${dimY - extPast}" stroke="${C.DIM}" stroke-width="0.25" />`;
            svg += `<line x1="${hX2}" y1="${objTop}" x2="${hX2}" y2="${dimY - extPast}" stroke="${C.DIM}" stroke-width="0.25" />`;
            svg += drawDim(hX1, dimY, hX2, dimY, `${dimHoriVal.toFixed(2)}' (${labelHori})`, false);

            // 2. Vertical Dimension (Left)
            const objLeft = -dimHoriVal * SCALE / 2;
            const dimX = objLeft - dimOffset;
            const vY1 = -dimVertVal * SCALE / 2;
            const vY2 = dimVertVal * SCALE / 2;

            svg += `<line x1="${objLeft}" y1="${vY1}" x2="${dimX - extPast}" y2="${vY1}" stroke="${C.DIM}" stroke-width="0.25" />`;
            svg += `<line x1="${objLeft}" y1="${vY2}" x2="${dimX - extPast}" y2="${vY2}" stroke="${C.DIM}" stroke-width="0.25" />`;
            svg += drawDim(dimX, vY1, dimX, vY2, `${dimVertVal.toFixed(2)}' (${labelVert})`, true);

            // --- 7. COMPASS (Added) ---
            if(typeof DrawUtils !== 'undefined' && DrawUtils.drawCompass) {
                svg += DrawUtils.drawCompass(compassX, compassY);
            }

            svg += `</svg>`;
            return svg;
        } catch(e) { return `<h3 style='color:red;'>Error: ${e.message}</h3>`; }
    }
};