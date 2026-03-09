async function generateBOM() {
    // 1. Check Data
    if (!window.lastBOMResults) {
        alert("Please click 'CALCULATE BOM' first!");
        return;
    }

    const data = window.lastBOMResults;
    const exportFormat = document.getElementById('ExportFormat').value;
    const outputUnit = document.getElementById('OutputUnit').value;

    // 2. Unit Converter Helper
    function convert(valInFeet) {
        if (!valInFeet && valInFeet !== 0) return "";
        let val = parseFloat(valInFeet);
        if (outputUnit === 'ft') return parseFloat(val.toFixed(2));
        if (outputUnit === 'm') return parseFloat((val / 3.28084).toFixed(3));
        if (outputUnit === 'cm') return parseFloat((val * 30.48).toFixed(1));
        if (outputUnit === 'mm') return parseFloat((val * 304.8).toFixed(1));
        if (outputUnit === 'inch') return parseFloat((val * 12).toFixed(2));
        if (outputUnit === 'ft_in') return parseFloat(val.toFixed(2)); 
        return val;
    }

    let unitLabel = "ft";
    if(outputUnit === 'm') unitLabel = "m";
    if(outputUnit === 'cm') unitLabel = "cm";
    if(outputUnit === 'mm') unitLabel = "mm";
    if(outputUnit === 'inch') unitLabel = "inch";

    // 3. System Stats
    const qNS = parseFloat(data.PVQtyNS) || 0;
    const qEW = parseFloat(data.PVQtyEW) || 0;
    const panelQty = qNS * qEW;
    
    // --- FIX START: READ CALCULATED KW DIRECTLY ---
    // Instead of trying to guess from the text, we read the exact math from Formulas.js
    let systemKW = parseFloat(data.SystemCapacityKW) || 0;
    const kwStr = systemKW.toFixed(2);
    // --- FIX END ---
    
    const headerTitle = `${kwStr}KW Solar Structure BILL OF MATERIAL`;
    
    // File Naming
    let namePart = data.CustName ? data.CustName.replace(/\s+/g,'') : "Client";
    let compPart = data.CompName ? "_" + data.CompName.replace(/\s+/g,'') : ""; 
    let locPart = data.CustLoc ? "_" + data.CustLoc.replace(/\s+/g,'') : ""; 
    
    // Single Declaration of fileName
    let fileName = `SolarStruktura_BOM_${kwStr}KW_${namePart}${compPart}${locPart}`; 

    // New Calculation: Area Covered (sq ft)
    const areaSqFt = (data.RawWidth * data.RawSlope).toFixed(2);
    let areaLabel = "sq.ft (approx.)";
    let areaVal = areaSqFt;
    if(outputUnit === 'm') {
        areaVal = (areaSqFt / 10.764).toFixed(2);
        areaLabel = "sq.m (approx.)";
    }

    // 4. Build Rows
    let rows = [];

    // 'data.PMod' now holds "550W" thanks to the fix in Formulas.js
    rows.push(["Solar Panel", data.PMod, `${convert(data.PL)} x ${convert(data.PW)}`, panelQty, ""]);

    let purDesc = data.PurProfileText === "Custom / Manual Entry" ? "Custom Profile" : data.PurProfileText;
    rows.push(["Purlin", purDesc, convert(data.FinalPurLen), data.PurlinQty, convert(data.FinalPurLen * data.PurlinQty)]);

    let rafDesc = data.RafProfileText === "Custom / Manual Entry" ? "Custom Profile" : data.RafProfileText;
    rows.push(["Rafter", rafDesc, convert(data.FinalRafLen), data.RafterQty, convert(data.FinalRafLen * data.RafterQty)]);

    let colDesc = data.ColProfileText === "Custom / Manual Entry" ? "Custom Profile" : data.ColProfileText;
    let totalColLen = 0;
    
    // Columns
    data.poleData.forEach(pole => {
        const qtyPerPole = data.ColQtyEW; 
        const totalLen = pole.val * qtyPerPole;
        totalColLen += totalLen;
        rows.push([`Vertical Support (Column/Pole)-${pole.id}`, colDesc, convert(pole.val), qtyPerPole, convert(totalLen)]);
    });

    rows.push(["Total Vertical Column", "", "", "", convert(totalColLen)]);

    // Walkways
    if(data.WWHoriQty > 0) rows.push(["Walkway (Horizontal)", data.WWHoriSpec, convert(data.RawWidth), data.WWHoriQty, convert(data.RawWidth*data.WWHoriQty)]);
    if(data.WWVertiQty > 0) rows.push(["Walkway (Vertical)", data.WWVertiSpec, convert(data.RawSlope), data.WWVertiQty, convert(data.RawSlope*data.WWVertiQty)]);

    // Plates
    const totalPoles = data.ColQtyNS * data.ColQtyEW;
    rows.push(["Total Base Plates", "Standard", "-", totalPoles, ""]);
    if(data.isTPVisible) rows.push(["Total Upper Plate", data.TPSpec, "-", totalPoles, ""]);
    
    // Foundation
    if(data.isFoundation) {
        rows.push([
            "Concrete Foundation Block",  
            data.foundSpec,                
            data.foundSize,                
            totalPoles,                    
            "-"                            
        ]);
    }

// NEW: Solar Panel Nut Bolts
    const includeNutBolts = document.getElementById('NutBoltCheck') ? document.getElementById('NutBoltCheck').checked : false;
    if(includeNutBolts) {
        rows.push([
            "Total Solar Panel Nut Bolts", 
            "Standard",                    
            "-",                           
            panelQty * 4,                  
            "-"                            
        ]);
    }





    // 5. EXPORT: EXCEL
    if (exportFormat === "xlsx") {
        var wb = XLSX.utils.book_new();
        
        // --- 1. DEFINE OLD FILE STYLING ---
        const sHeader = { fill: { fgColor: { rgb: "404040" } }, font: { color: { rgb: "FFFFFF" }, bold: true, sz: 16 }, alignment: { horizontal: "center" } };
        const sColHead = { fill: { fgColor: { rgb: "404040" } }, font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 }, alignment: { horizontal: "center" } };
        const sCellCenter = { alignment: { horizontal: "center" } };

        // --- 2. PREPARE DATA ROWS ---
        let ws_data = [
            [headerTitle, "", "", "", ""], 
            ["Item Description", "Specification", `Dimensions (${unitLabel})`, "Qty", `Total (${unitLabel})`], 
        ];

        rows.forEach(r => ws_data.push(r));

        ws_data.push([]); 
        
        let subHeadRow = ws_data.length; 
        ws_data.push(["ADDITIONAL INFO", "", "", "", ""]);
        
        ws_data.push(["Structure Tilt Angle", data.TiltA + "°", "", "", ""]);
        ws_data.push(["Structure Front Height", convert(data.SFH) + " " + unitLabel, "", "", ""]);
        ws_data.push(["Structure Back Height", convert(data.SBH) + " " + unitLabel, "", "", ""]);
        ws_data.push(["Column / Pole Spacing (N–S)", convert(data.PtoPNS) + " " + unitLabel, "", "", ""]);
        ws_data.push(["Column / Pole Spacing (E-W)", convert(data.PtoPEW) + " " + unitLabel, "", "", ""]);
        ws_data.push(["Area Covered by Solar Panels", areaVal + " " + areaLabel, "", "", ""]);
        
        // Footnote row index
        // Add 2 to 3 empty lines for spacing
        ws_data.push([]); 
        ws_data.push([]); 
        ws_data.push([]);

        let footerRow = ws_data.length;
        ws_data.push(["Bill of Material Generated By www.solarstruktura.com"]);

        // --- 3. CONVERT TO WORKSHEET ---
        var ws = XLSX.utils.aoa_to_sheet(ws_data);

        // --- 4. APPLY MERGES (AS PER OLD CODE) ---
        if(!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: {r:0, c:0}, e: {r:0, c:4} });           // Main Title
        ws['!merges'].push({ s: {r:subHeadRow, c:0}, e: {r:subHeadRow, c:4} }); // Additional Info
        ws['!merges'].push({ s: {r:footerRow, c:0}, e: {r:footerRow, c:4} });   // Footnote

        // --- 5. APPLY CELL STYLING LOOP (AS PER OLD CODE) ---
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({r: R, c: C});
                if (!ws[cellRef]) continue;

                if (R === 0) {
                    ws[cellRef].s = sHeader;
                } else if (R === 1 || R === subHeadRow || R === footerRow) {
                    ws[cellRef].s = sColHead; 
                } else {
                    ws[cellRef].s = sCellCenter;
                }
            }
        }

        // --- 6. SET COLUMN WIDTHS & SAVE ---
        ws['!cols'] = [{wch:35}, {wch:35}, {wch:15}, {wch:10}, {wch:15}];
        XLSX.utils.book_append_sheet(wb, ws, "BOM");
        XLSX.writeFile(wb, fileName + ".xlsx");

  // 6. EXPORT: PDF
    } else {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // --- 1. INSERT LOGO (Canvas Rasterization Method) ---
        if (typeof COMPANY_LOGO_SVG !== 'undefined' && COMPANY_LOGO_SVG) {
            try {
                // Helper: Convert SVG string to PNG Data URL
                const svgToPng = (svgStr) => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        // 1. Create Base64 URI
                        const svg64 = btoa(unescape(encodeURIComponent(svgStr)));
                        img.src = 'data:image/svg+xml;base64,' + svg64;
                        img.onload = () => {
                            // 2. Draw to Canvas
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            // 3. Return PNG
                            resolve(canvas.toDataURL('image/png'));
                        };
                        img.onerror = (e) => { 
                            console.error("Image load error", e); 
                            resolve(null); 
                        };
                    });
                };

                // Await conversion and add to PDF
                const pngData = await svgToPng(COMPANY_LOGO_SVG);
                if(pngData) {
                    doc.addImage(pngData, 'PNG', 170, 4, 35, 12);
                                        // x=170 (Right Side), y=4 (Top), w=35, h=12
                }
            } catch(e) {
                console.error("Logo Rasterization Error:", e);
            }
        }
        // ----------------------------------------------------
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        // Header Title
        doc.text(headerTitle, 105, 25, null, null, 'center'); 

        doc.setFontSize(10);
        let infoLine = `Customer: ${data.CustName || "-"} | Location: ${data.CustLoc || "-"}`;
        if(data.CompName) infoLine += ` | Company: ${data.CompName}`;
        doc.text(infoLine, 105, 32, null, null, 'center');

        const pdfRows = rows.map(r => r.map(c => c === "" ? "-" : c));

        doc.autoTable({
            startY: 40, 
            head: [['Item Description', 'Specification', `Dimensions (${unitLabel})`, 'Qty', `Total (${unitLabel})`]],
            body: pdfRows,
            theme: 'grid',
            headStyles: { fillColor: [64, 64, 64], halign: 'center', textColor: 255, fontStyle: 'bold' },
            bodyStyles: { halign: 'center' },
            columnStyles: { 0: { halign: 'left' } } 
        });

        let finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255); 
        doc.setFillColor(64, 64, 64);
        doc.rect(14, finalY, 182, 8, 'F');
        doc.text("ADDITIONAL INFO", 105, finalY + 6, null, null, 'center');
        
        doc.setTextColor(0, 0, 0); 
        
        let additionalInfoBody = [];
        additionalInfoBody.push(["Structure Tilt Angle", data.TiltA + "°"]);
        additionalInfoBody.push(["Structure Front Height", convert(data.SFH) + " " + unitLabel]);
        additionalInfoBody.push(["Structure Back Height", convert(data.SBH) + " " + unitLabel]);
        additionalInfoBody.push(["Column / Pole Spacing (N–S)", convert(data.PtoPNS) + " " + unitLabel]);
        additionalInfoBody.push(["Column / Pole Spacing (E-W)", convert(data.PtoPEW) + " " + unitLabel]);
        additionalInfoBody.push(["Area Covered by Solar Panels", areaVal + " " + areaLabel]);

        doc.autoTable({
            startY: finalY + 8,
            body: additionalInfoBody,
            theme: 'plain',
            styles: { halign: 'center' }
        });

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100); 
        doc.setFont("helvetica", "italic");
        doc.text("Bill of Material Generated By www.solarstruktura.com", 105, 290, null, null, 'center');

        // --- SAVE FILE (Must be the last step) ---
        doc.save(fileName + ".pdf");
    }
}