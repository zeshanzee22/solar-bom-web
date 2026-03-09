const DrawColumnGap = {
    draw: function() {
        try {
            // --- 1. SETUP ---
            const rawData = localStorage.getItem('solarBOMData');
            if(!rawData) return '<h3 style="text-align:center;">No Data</h3>';
            const data = JSON.parse(rawData);
            
            const isLandscape = (data.Orient || "").toLowerCase() === "landscape";
            const SCALE = 10;
            
            const C = {
                RAFTER: "#ffc022",
                COLUMN: "#ff5a48",
                DIM: "#000000",
                STROKE: "#000000"
            };

            const colQtyEW = parseInt(data.ColQtyEW);
            const colQtyNS = parseInt(data.ColQtyNS);
            const spacingEW = parseFloat(data.PtoPEW);
            const spacingNS = parseFloat(data.PtoPNS);
            const cantiEW = parseFloat(data.CLEW) || 0;
            const cantiNS = parseFloat(data.CLNS) || 0;
            
            const rawRaf = parseFloat(data.FinalRafLen);
            const rawPur = parseFloat(data.FinalPurLen);
            const dimHori = isLandscape ? rawRaf : rawPur; 

            const structW = ((colQtyEW-1) * spacingEW) + (cantiEW*2);
            const structH = ((colQtyNS-1) * spacingNS) + (cantiNS*2);
            
            const drawW = Math.max(structW, dimHori);
            const drawH = structH;

            // --- OFFSETS ---
            const dimOffsetH = 8 * SCALE; 
            const dimOffsetV = 8 * SCALE; 
            
            // --- VIEWBOX SETUP (MATCHING REFERENCE) ---
            // 1. Fixed Top-Left Margins (-180, -60) like PanelLayout
            const vbMinX = -180;
            const vbMinY = -75;
            
            // 2. Total Width/Height calculated from Content + Padding
            const vbWidth = (drawW * SCALE) + 450; 
            const vbHeight = (drawH * SCALE) + 200; // Extra space for compass at bottom

            // 3. Compass Position (Fixed relative to content)
            const compassX = -120;
            const compassY = (drawH * SCALE) + 80;

            let svg = DrawUtils.createSVG("colGapSVG", `${vbMinX} ${vbMinY} ${vbWidth} ${vbHeight}`);

            // --- 2. HELPERS ---

            const drawRect = (x, y, w, h, fill) => {
                return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.STROKE}" stroke-width="0.25" />`;
            };

            const drawDimSegment = (x1, y1, x2, y2, text, isVert) => {
                // Main dimension line segment
                let s = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.DIM}" stroke-width="0.25" />`;
                const t = 3; // Tick size
                
                // Ticks at the start and end of this segment
                s += `<line x1="${x1-t}" y1="${y1+t}" x2="${x1+t}" y2="${y1-t}" stroke="${C.DIM}" stroke-width="0.8" />`;
                s += `<line x1="${x2-t}" y1="${y2+t}" x2="${x2+t}" y2="${y2-t}" stroke="${C.DIM}" stroke-width="0.8" />`;

                if(isVert) {
                    // Vertical text
                    const tx = x1 + (3 * SCALE); 
                    const ty = (y1+y2)/2;
                    s += `<text x="${tx}" y="${ty}" transform="rotate(-90, ${tx}, ${ty})" text-anchor="middle" dominant-baseline="auto" font-family="Arial" font-size="12" font-weight="bold" fill="${C.DIM}">${text}</text>`;
                } else {
                    // Horizontal text
                    const ty = y1 + (4 * SCALE);
                    s += `<text x="${(x1+x2)/2}" y="${ty}" text-anchor="middle" dominant-baseline="hanging" font-family="Arial" font-size="12" font-weight="bold" fill="${C.DIM}">${text}</text>`;
                }
                return s;
            };

            // --- 3. DRAWING ---

            const startX = (drawW - structW) / 2;
            const colSize = 0.8 * SCALE;
            let lastY = 0; let lastX = 0; // For final extension lines

            for(let i=0; i<colQtyEW; i++) {
                let x = (startX + cantiEW + (i * spacingEW)) * SCALE;
                if (i === colQtyEW - 1) lastX = x;

                for(let j=0; j<colQtyNS; j++) {
                    let y = (cantiNS + (j * spacingNS)) * SCALE;
                    if (j === colQtyNS - 1) lastY = y;
                    
                    // Rafters
                    if(isLandscape) {
                        if(i===0) { 
                            const rafThick = 0.3 * SCALE;
                            let rX = (drawW - dimHori)/2 * SCALE;
                            svg += drawRect(rX, y - rafThick/2, dimHori*SCALE, rafThick, C.RAFTER);
                        }
                    } else {
                        if(j===0) {
                            const rafW = 0.25 * SCALE;
                            const dimVert = parseFloat(data.FinalRafLen); 
                            svg += drawRect(x - rafW/2, 0, rafW, dimVert*SCALE, C.RAFTER);
                        }
                    }

                    // Columns
                    svg += drawRect(x - colSize/2, y - colSize/2, colSize, colSize, C.COLUMN);

                    // --- DIMENSIONS (Loop Area) ---
                    
                    // 1. Horizontal SpacingSegments (Bottom Row)
                    if(j === colQtyNS - 1 && i < colQtyEW - 1) {
                        let nextX = (startX + cantiEW + ((i+1) * spacingEW)) * SCALE;
                        const extStart = y + colSize/2; 
                        const dimY = y + dimOffsetH;
                        
                        // Draw ONLY the left extension for this segment
                        svg += `<line x1="${x}" y1="${extStart}" x2="${x}" y2="${dimY}" stroke="${C.DIM}" stroke-width="0.25" />`;
                        // Draw dimension segment
                        svg += drawDimSegment(x, dimY, nextX, dimY, spacingEW.toFixed(2)+"'", false);
                    }

                    // 2. Vertical Spacing Segments (Right Column)
                    if(i === colQtyEW - 1 && j < colQtyNS - 1) {
                        let nextY = (cantiNS + ((j+1) * spacingNS)) * SCALE;
                        const extStart = x + colSize/2;
                        const dimX = x + dimOffsetV;

                        // Draw ONLY the top extension for this segment
                        svg += `<line x1="${extStart}" y1="${y}" x2="${dimX}" y2="${y}" stroke="${C.DIM}" stroke-width="0.25" />`;
                        // Draw dimension segment
                        svg += drawDimSegment(dimX, y, dimX, nextY, spacingNS.toFixed(2)+"'", true);
                    }
                }
            }

            // --- FINAL EXTENSION LINES ---
            // Draw the very last extension lines to close the dimensions
            
            // Final Right Extension for Bottom Dims
            const finalExtStartY = lastY + colSize/2;
            const finalDimY = lastY + dimOffsetH;
            svg += `<line x1="${lastX}" y1="${finalExtStartY}" x2="${lastX}" y2="${finalDimY}" stroke="${C.DIM}" stroke-width="0.25" />`;

            // Final Bottom Extension for Right Dims
            const finalExtStartX = lastX + colSize/2;
            const finalDimX = lastX + dimOffsetV;
            svg += `<line x1="${finalExtStartX}" y1="${lastY}" x2="${finalDimX}" y2="${lastY}" stroke="${C.DIM}" stroke-width="0.25" />`;

            /// --- COMPASS ---
            if(typeof DrawUtils !== 'undefined' && DrawUtils.drawCompass) {
                svg += DrawUtils.drawCompass(compassX, compassY);
            }

            svg += `</svg>`;
            return svg;
        } catch(e) {
            return `<h3 style='color:red;'>Error: ${e.message}</h3>`;
        }
    }
};