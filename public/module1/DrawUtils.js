const DrawUtils = {
    COLOR: {
        COLUMN: "#ff5a48",   // Red
        PANEL: "#2C7BE5",    // Blue
        PURLIN: "#6d6e70",   // Grey
        RAFTER: "#ffc022",   // Yellow
        WALKWAY: "#50C878",  // Green
        GROUND: "#300b08",   // Brown
        DIM_LINE: "#000000"  // Black
    },

    // Generates the opening SVG tag
    createSVG: function(id, viewBox) {
        return `<svg id="${id}" width="100%" height="100%" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="background:white;">
            <defs>
                <marker id="tick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M0,10 L10,0" stroke="black" stroke-width="2" />
                </marker>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M0,0 L10,5 L0,10 z" fill="black" />
                </marker>
            </defs>`;
    },

    createRect: function(x, y, w, h, color, stroke="none") {
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" stroke="${stroke}" stroke-width="${stroke==='none'?0:1}" />`;
    },

    createLine: function(x1, y1, x2, y2, color, width=1, dashArray="") {
        const dash = dashArray ? `stroke-dasharray="${dashArray}"` : "";
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash} />`;
    },

    createText: function(x, y, text, size=14, rotation=0, anchor="middle", weight="normal") {
        const transform = rotation ? `transform="rotate(${rotation}, ${x}, ${y})"` : "";
        return `<text x="${x}" y="${y}" fill="black" font-weight="${weight}" font-family="Arial" font-size="${size}" text-anchor="${anchor}" ${transform}>${text}</text>`;
    },

    // Standard Dimension Line with Ticks
    drawDim: function(x1, y1, x2, y2, text, offset=30, isVert=false) {
        // Main Line
        let s = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="2" marker-start="url(#tick)" marker-end="url(#tick)" />`;
        
        // Extension Lines (Perpendicular drops)
        if(!isVert) {
            s += `<line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y1+15}" stroke="black" stroke-width="1" />`;
            s += `<line x1="${x2}" y1="${y2}" x2="${x2}" y2="${y2+15}" stroke="black" stroke-width="1" />`;
        } else {
            s += `<line x1="${x1}" y1="${y1}" x2="${x1+15}" y2="${y1}" stroke="black" stroke-width="1" />`;
            s += `<line x1="${x2}" y1="${y2}" x2="${x2+15}" y2="${y2}" stroke="black" stroke-width="1" />`;
        }

        // Text Calculation
        let mx = (x1 + x2) / 2;
        let my = (y1 + y2) / 2;
        let rot = isVert ? -90 : 0;
        let tX = isVert ? mx - 10 : mx;
        let tY = isVert ? my : my - 10;
        
        s += this.createText(tX, tY, text, 14, rot);
        return s;
    },

    // --- Compass Function (4 Sides) ---
    drawCompass: function(x, y, size=50) {
        const half = size / 2;
        const cx = x + half;
        const cy = y - half; 

        // Circle
        let svg = `<circle cx="${cx}" cy="${cy}" r="${12}" fill="none" stroke="black" stroke-width="1" />`;
        
        // Arrows
        // N-S
        svg += `<line x1="${cx}" y1="${cy + half}" x2="${cx}" y2="${cy - half}" stroke="black" stroke-width="1.5" marker-end="url(#arrow)" />`; 
        // E-W
        svg += `<line x1="${cx - half}" y1="${cy}" x2="${cx + half}" y2="${cy}" stroke="black" stroke-width="1.5" marker-end="url(#arrow)" />`; 

        // Labels
        svg += this.createText(cx, cy - half - 15, "N", 12, 0, "middle", "bold");
        svg += this.createText(cx, cy + half + 15, "S", 12, 0, "middle", "bold");
        svg += this.createText(cx + half + 15, cy + 4, "E", 12, 0, "start", "bold");
        svg += this.createText(cx - half - 15, cy + 4, "W", 12, 0, "end", "bold");

        return svg;
    }
};