// ===============================================
// PDF EXPORT ENGINE (Phase 3: 1-Pager Final)
// ===============================================

function exportToPDF() {
    try {
        const { jsPDF } = window.jspdf;
        // A4 Landscape format (297mm x 210mm)
        const doc = new jsPDF('landscape', 'mm', 'a4'); 
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 1. GATHER UI DATA
        const companyName = document.getElementById('cust-company').value || "Company";
        const custName = document.getElementById('cust-name').value || "Customer";
        const custLoc = document.getElementById('cust-loc').value || "Location";
        
        // 2. DYNAMIC PANEL MATH & CAPACITY (Canvas Scanner)
        let totalPanels = 0;
        let elevatedCount = 0;
        let fixTypes = {}; // Stores counts like { "L2": 5, "L3": 2 }
        let totalAreaSqFt = 0;

        // Loop through all objects physically on the canvas
        canvas.getObjects().forEach(obj => {
            if (obj.isSolarGroup) {
                // A. Calculate Area based on true geometry
                if (obj.trueW && obj.trueH) {
                    const widthInFt = obj.trueW / 10;
                    const heightInFt = obj.trueH / 10;
                    totalAreaSqFt += (widthInFt * heightInFt);
                }

                const type = obj.solarConfig && obj.solarConfig.type ? obj.solarConfig.type : null;
                const prefix = obj.solarConfig && obj.solarConfig.prefix ? obj.solarConfig.prefix : 'L'; 

                // B. ELEVATED: Just count the remaining panels
                if (type === 'elevated') {
                    elevatedCount++;
                    obj.getObjects().forEach(sub => {
                        if (sub.isPanel) totalPanels++;
                    });
                } 
                // C. GROUND MOUNT: Group by columns to find L2/L3 types
                else if (type === 'ground') {
                    let tableCounts = {}; // "Row_Col" -> Panel Count
                    obj.getObjects().forEach(sub => {
                        if (sub.isPanel) {
                            const key = `${sub.myRow}_${sub.myCol}`;
                            tableCounts[key] = (tableCounts[key] || 0) + 1;
                        }
                    });

                    // Tally up the dynamic types
                    Object.values(tableCounts).forEach(count => {
                        if (count > 0) {
                            const label = `${prefix}${count}`; // e.g., L3
                            fixTypes[label] = (fixTypes[label] || 0) + 1;
                            totalPanels += count; // Add to global capacity
                        }
                    });
                }
            }
        });

        // Generate the formatted "Structure Type" label
        let structLabels = [];
        if (elevatedCount > 0) structLabels.push(`${elevatedCount}xElevated`);
        Object.entries(fixTypes).forEach(([typeLabel, qty]) => {
            structLabels.push(`${qty}x${typeLabel}`);
        });
        
        const structLabel = structLabels.length > 0 ? structLabels.join(', ') : "None";
        const areaSqFt = totalAreaSqFt > 0 ? totalAreaSqFt.toFixed(1) : "0.0";

        // Get Wattage
        let wattage = 0;
        const panelVal = document.getElementById('panel-model').value;
        if (panelVal === 'custom') {
            wattage = parseFloat(document.getElementById('custom-watt').value) || 0;
        } else if (typeof PANEL_DB !== 'undefined' && PANEL_DB[panelVal]) {
            wattage = PANEL_DB[panelVal].wattage;
        }

        const capacityKw = ((wattage * totalPanels) / 1000).toFixed(2);
        
        // 3. DRAW MAIN TITLE
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(64, 64, 64);
        doc.text("2D Solar Panel Layout", 14, 20);

       // 4. DRAW MAIN CANVAS IMAGE
        canvas.discardActiveObject();
        canvas.renderAll();

        // Dynamically grab the user's selected quality from the dropdown (default to 3 if missing)
        const qualitySelect = document.getElementById('export-quality');
        const userMultiplier = qualitySelect ? parseInt(qualitySelect.value) : 3;

        // Take the picture EXACTLY as the user has zoomed/panned on screen
        const canvasImgData = canvas.toDataURL({ 
            format: 'png', 
            multiplier: userMultiplier, 
            quality: 1.0 // (Ignored by PNG, but good practice)
        });

        // 5. Calculate perfect dimensions to fit the A4 page
        const maxImgWidth = 260; 
        const maxImgHeight = 135; 
        const canvasAspect = canvas.width / canvas.height;
        
        let printWidth = maxImgWidth;
        let printHeight = maxImgWidth / canvasAspect;
        
        // Ensure it never bleeds off the bottom of the page
        if (printHeight > maxImgHeight) {
            printHeight = maxImgHeight;
            printWidth = maxImgHeight * canvasAspect;
        }
        
        const imgX = (pageWidth - printWidth) / 2; 
        const imgY = 25;
        
        // 6. ACTUALLY ADD THE IMAGE TO THE PDF!
        doc.addImage(canvasImgData, 'PNG', imgX, imgY, printWidth, printHeight);

        // 5. COMPASS W/ EXACT AZIMUTH & N, E, S, W
        const numDeg = parseFloat(document.getElementById('azimuth').value) || 180;
        
        let dirText = "S";
        if (numDeg < 180) dirText = "SE";
        if (numDeg > 180) dirText = "SW";
        if (numDeg === 180) dirText = "S";
        const azLabel = `${dirText} ${numDeg}°`;

        const compX = 25;
        const compY = 145; 
        
        doc.setDrawColor(50);
        doc.setLineWidth(0.5);
        doc.circle(compX, compY, 12);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50);
        doc.text("N", compX, compY - 14, { align: 'center' });
        doc.text("S", compX, compY + 17, { align: 'center' });
        doc.text("E", compX + 14, compY + 3.5, { align: 'center' });
        doc.text("W", compX - 14, compY + 3.5, { align: 'center' });

        const angleRad = (numDeg - 90) * (Math.PI / 180); 
        const nx = compX + Math.cos(angleRad) * 10;
        const ny = compY + Math.sin(angleRad) * 10;
        
        doc.setDrawColor(220, 53, 69); 
        doc.setLineWidth(1);
        doc.line(compX, compY, nx, ny);
        doc.setFillColor(50);
        doc.circle(compX, compY, 1.5, 'F'); 

        doc.setTextColor(44, 123, 229);
        doc.text(azLabel, compX, compY + 23, { align: 'center' });

        // 6. GENERATE THE TABLE
        const tableBody = [[
            custName,
            custLoc,
            `${capacityKw}KW`,
            `${wattage}W x ${totalPanels}`,
            structLabel,
            `${areaSqFt} sqft`,
            companyName
        ]];

        doc.autoTable({
            startY: 172, 
            margin: { bottom: 5, left: 14, right: 14 }, 
            head: [['Customer Name', 'Location', 'System Capacity', 'Solar Panel & Qty', 'Structure Type', 'Area Covered By Solar Panels', 'Company Name']],
            body: tableBody,
            theme: 'grid',
            headStyles: { 
                fillColor: '#404040', 
                textColor: 255,
                halign: 'center',
                valign: 'middle',
                fontStyle: 'bold'
            }, 
            bodyStyles: { 
                halign: 'center',
                valign: 'middle',
                textColor: 50
            },
            styles: { fontSize: 9, cellPadding: 4 }
        });

        // 7. BOTTOM LEFT WATERMARK (Dynamically placed exactly below the table)
        const finalY = doc.lastAutoTable.finalY || 190; // Gets the exact Y coordinate where the table finished
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(109, 109, 109); 
        doc.text("Generated by www.solarstruktura.com", 14, finalY + 6); // Placed 6mm below the table

        // 8. SAVE WITH DYNAMIC FILE NAME
        const cleanCustName = custName.replace(/[^a-zA-Z0-9]/g, '');
        const cleanLoc = custLoc.replace(/[^a-zA-Z0-9]/g, '');
        const cleanComp = companyName.replace(/[^a-zA-Z0-9 ]/g, '');
        
        const fileName = `SolarStruktura_Solar 2D Layout_${capacityKw}KW_${cleanCustName}_${cleanLoc}_${cleanComp}.pdf`;
        doc.save(fileName);
        
    } catch (error) {
        console.error("PDF Generation Error: ", error);
        alert("Oops! Something went wrong generating the PDF: " + error.message);
    }
}