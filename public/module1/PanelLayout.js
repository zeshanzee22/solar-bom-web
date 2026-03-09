const DrawSolarLayout = {
    draw: function() {
        try {
            // --- 1. SETUP & DATA ---
            const rawData = localStorage.getItem('solarBOMData');
            if(!rawData) return '<h3 style="text-align:center;">No Data Found</h3>';
            const data = JSON.parse(rawData);

            const SCALE = 10;
            const C = {
                PANEL: "#2C7BE5",
                WALKWAY: "#50C878", 
                DIM: "#000000",
                STROKE: "#000000", 
                DIM_LINE: "#555555"
            };

            const isLandscape = (data.Orient || "").toLowerCase() === "landscape";
            const rawPL = parseFloat(data.PL);
            const rawPW = parseFloat(data.PW);
            const stepNS = isLandscape ? rawPW : rawPL;
            const stepEW = isLandscape ? rawPL : rawPW;

            const rowsNS = parseInt(data.PVQtyNS) || 1; 
            const colsEW = parseInt(data.PVQtyEW) || 1; 
            const gapNS_Ft = parseFloat(data.PVGapNS) || 0.01; 
            const gapEW_Ft = parseFloat(data.PVGapEW) || 0.01; 
            const walkways = Array.isArray(data.walkwayList) ? data.walkwayList : [];

            // Match Logic
            const isRowSplit = (w) => (w.type || "").toLowerCase().match(/horizontal|row|n-s/);
            const isColSplit = (w) => (w.type || "").toLowerCase().match(/vertical|col|e-w/);
            const getIndex = (w) => {
                if(w.afterIndex !== undefined) return parseInt(w.afterIndex);
                if(w.index !== undefined) return parseInt(w.index);
                return -1;
            };

            // --- 2. POSITIONS ---
            let rowPos = [0]; 
            let currentY = 0;
            for(let r=1; r<rowsNS; r++) {
                currentY += stepNS;
                let ww = walkways.find(w => isRowSplit(w) && getIndex(w) === r);
                currentY += (ww ? parseFloat(ww.size) : gapNS_Ft);
                rowPos.push(currentY);
            }
            const totalH = rowPos[rowsNS-1] + stepNS;

            let colPos = [0]; 
            let currentX = 0;
            for(let c=1; c<colsEW; c++) {
                currentX += stepEW;
                let ww = walkways.find(w => isColSplit(w) && getIndex(w) === c);
                currentX += (ww ? parseFloat(ww.size) : gapEW_Ft);
                colPos.push(currentX);
            }
            const totalW = colPos[colsEW-1] + stepEW;

           // UPDATED: Accepts optional id and className
const drawRect = (x, y, w, h, fill, id="", className="") => 
    `<rect id="${id}" class="${className}" x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.STROKE}" stroke-width="0.25" />`;
            
            const drawHoriDim = (x1, x2, yLevel, text) => {
                let s = `<line x1="${x1}" y1="${yLevel}" x2="${x2}" y2="${yLevel}" stroke="${C.DIM}" stroke-width="0.5" />`;
                const t = 3;
                s += `<line x1="${x1-t}" y1="${yLevel+t}" x2="${x1+t}" y2="${yLevel-t}" stroke="${C.DIM}" stroke-width="1" />`;
                s += `<line x1="${x2-t}" y1="${yLevel+t}" x2="${x2+t}" y2="${yLevel-t}" stroke="${C.DIM}" stroke-width="1" />`;
                const midX = (x1 + x2) / 2;
                s += `<text x="${midX}" y="${yLevel - 5}" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="${C.DIM}">${text}</text>`;
                return s;
            };

            const drawVertDim = (targetX, y1, y2, text, isRightSide) => {
                let s = `<line x1="${targetX}" y1="${y1}" x2="${targetX}" y2="${y2}" stroke="${C.DIM}" stroke-width="0.5" />`;
                const t = 3;
                s += `<line x1="${targetX-t}" y1="${y1+t}" x2="${targetX+t}" y2="${y1-t}" stroke="${C.DIM}" stroke-width="1" />`;
                s += `<line x1="${targetX-t}" y1="${y2+t}" x2="${targetX+t}" y2="${y2-t}" stroke="${C.DIM}" stroke-width="1" />`;
                const midY = (y1 + y2) / 2;
                const txtX = isRightSide ? targetX + 5 : targetX - 5;
                const anchor = isRightSide ? "start" : "end";
                s += `<text x="${txtX}" y="${midY}" text-anchor="${anchor}" dominant-baseline="middle" font-family="Arial" font-size="12" font-weight="bold" fill="${C.DIM}">${text}</text>`;
                return s;
            };
            
            const drawExtLineX = (x, yFrom, yTo) => `<line x1="${x}" y1="${yFrom}" x2="${x}" y2="${yTo}" stroke="${C.DIM_LINE}" stroke-width="0.5" />`;
            const drawExtLineY = (y, xFrom, xTo) => `<line x1="${xFrom}" y1="${y}" x2="${xTo}" y2="${y}" stroke="${C.DIM_LINE}" stroke-width="0.5" />`;

            // --- 4. DRAW ---
            let svgContent = "";

  // Panels
            for(let r=0; r<rowsNS; r++) {
                for(let c=0; c<colsEW; c++) {
                    const pID = `p-${r}-${c}`;
                    
                    // CHECK GLOBAL MEMORY: Is this panel an air pocket?
                    let isHidden = window.solarAirPockets && window.solarAirPockets.has(pID);
                    
                    // If hidden, use gray/transparent. If active, use standard Blue.
                    let finalFill = isHidden ? "#cccccc" : C.PANEL;
                    let finalOpacity = isHidden ? "0.1" : "1";

                    // We manually build the rect string with opacity included
                    svgContent += `<rect id="${pID}" class="clickable-panel" x="${colPos[c]*SCALE}" y="${rowPos[r]*SCALE}" width="${stepEW*SCALE}" height="${stepNS*SCALE}" fill="${finalFill}" fill-opacity="${finalOpacity}" stroke="${C.STROKE}" stroke-width="0.25" />`;
                }
            }

            // Walkways
            walkways.filter(w => isColSplit(w)).forEach(ww => {
                let idx = getIndex(ww);
                if(idx > 0 && idx < colsEW) {
                    let size = parseFloat(ww.size);
                    let xStart = (colPos[idx-1] + stepEW) * SCALE;
                    svgContent += drawRect(xStart, 0, size*SCALE, totalH*SCALE, C.WALKWAY);
                    let dimY = (totalH * SCALE) + (3 * SCALE); 
                    let xEnd = xStart + (size * SCALE);
                    svgContent += drawExtLineX(xStart, totalH*SCALE, dimY);
                    svgContent += drawExtLineX(xEnd, totalH*SCALE, dimY);
                    svgContent += drawHoriDim(xStart, xEnd, dimY, size.toFixed(2)+"'");
                }
            });
            walkways.filter(w => isRowSplit(w)).forEach(ww => {
                let idx = getIndex(ww);
                if(idx > 0 && idx < rowsNS) {
                    let size = parseFloat(ww.size);
                    let yStart = (rowPos[idx-1] + stepNS) * SCALE;
                    svgContent += drawRect(0, yStart, totalW*SCALE, size*SCALE, C.WALKWAY);
                    let dimX = (totalW * SCALE) + (3 * SCALE); 
                    let yEnd = yStart + (size * SCALE);
                    svgContent += drawExtLineY(yStart, totalW*SCALE, dimX);
                    svgContent += drawExtLineY(yEnd, totalW*SCALE, dimX);
                    svgContent += drawVertDim(dimX, yStart, yEnd, size.toFixed(2)+"'", true);
                }
            });

            // Dimensions
            const topDimY = -(4 * SCALE);
            svgContent += drawExtLineX(0, 0, topDimY);
            svgContent += drawExtLineX(totalW*SCALE, 0, topDimY);
            svgContent += drawHoriDim(0, totalW*SCALE, topDimY, totalW.toFixed(2)+"'");
            
            const leftDimX = -(4 * SCALE); 
            svgContent += drawExtLineY(0, 0, leftDimX);
            svgContent += drawExtLineY(totalH*SCALE, 0, leftDimX);
            svgContent += drawVertDim(leftDimX, 0, totalH*SCALE, totalH.toFixed(2)+"'", false);

            // --- 5. COMPASS ---
            const drawH = totalH * SCALE;
            // Position: Fixed Offset relative to drawing
            const compassX = -120; // Fixed Left Position
            const compassY = drawH + 80; // Fixed Bottom Position
            svgContent += DrawUtils.drawCompass(compassX, compassY);

            // --- 6. VIEWBOX FIX ---
            // We explicitly set minX to cover the compass area (-160 cover compassX at -120 + radius)
            // We set Height to cover compassY
            const vbMinX = -180; 
            const vbMinY = -75; 
            const vbWidth = (totalW * SCALE) + 250; // Add enough width to cover right side
            const vbHeight = (compassY) + 100;      // Add enough height to cover bottom

            return DrawUtils.createSVG("panelLayoutSVG", `${vbMinX} ${vbMinY} ${vbWidth} ${vbHeight}`) + svgContent + "</svg>";

        } catch(e) {
            console.error(e);
            return `<h3 style='color:red;'>Error: ${e.message}</h3>`;
        }
    }
};