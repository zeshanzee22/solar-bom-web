const TO_FT = { 'mm': 1/304.8, 'm': 3.28084, 'inch': 1/12, 'ft': 1, 'cm': 1/30.48 };

function getValInFeet(id) {
    const val = parseFloat(document.getElementById(id).value) || 0;
    const unit = document.getElementById(id + '_unit').value;
    return val * TO_FT[unit];
}

function getRawInputStr(id) {
    return `${document.getElementById(id).value} ${document.getElementById(id + '_unit').value}`;
}

function formatOutput(valInFeet) {
    const unit = document.getElementById('OutputUnit').value;
    if (unit === 'ft_in') {
        const sign = valInFeet < 0 ? "-" : "";
        const absVal = Math.abs(valInFeet);
        const ft = Math.floor(absVal);
        const inch = (absVal - ft) * 12;
        return `${sign}${ft}' ${inch.toFixed(2)}"`;
    }
    if (unit === 'ft') return valInFeet.toFixed(2) + " ft";
    if (unit === 'm') return (valInFeet / 3.28084).toFixed(3) + " m";
     if (unit === 'cm') return (valInFeet * 30.48).toFixed(3) + " cm";
    if (unit === 'mm') return (valInFeet * 304.8).toFixed(1) + " mm";
    if (unit === 'inch') return (valInFeet * 12).toFixed(2) + " in";
    return valInFeet.toFixed(2) + " ft";
}

function calculateBOM() {
    // 1. CAPTURE INPUTS
    const cName = document.getElementById('CustName').value;
    const cLoc = document.getElementById('CustLoc').value;
    const cComp = document.getElementById('CompName').value;
    const notesVal = document.getElementById('ProjectNotes').value; 

    const CustName = cName ? cName.trim() : "";
    const CustLoc = cLoc ? cLoc.trim() : "";
    const CompName = cComp ? cComp.trim() : "";

    const PModInput = document.getElementById('PMod').value; // Raw Dropdown
    const PVhole = getValInFeet('PVhole');
    const Orient = document.getElementById('Orient').value;
    const PVQtyNS = parseFloat(document.getElementById('PVQtyNS').value) || 0;
    const PVQtyEW = parseFloat(document.getElementById('PVQtyEW').value) || 0;
    const PVGapNS = getValInFeet('PVGapNS');
    const PVGapEW = getValInFeet('PVGapEW');
    const PurH = getValInFeet('PurH');
    const PurW = getValInFeet('PurW');
    const RafH = getValInFeet('RafH');
    const RafW = getValInFeet('RafW');
    let ColH = getValInFeet('ColH'); 
    let ColW = getValInFeet('ColW'); 
    const TiltA = parseFloat(document.getElementById('TiltA').value) || 0;
    const SFH = getValInFeet('SFH');
    const ColQtyNS = parseFloat(document.getElementById('ColQtyNS').value) || 0;
   // --- SMART CANTILEVER LOGIC ---
let isCustomCLNS = document.getElementById('CustomCLNSCheck') && document.getElementById('CustomCLNSCheck').checked;
let frontCLNS, backCLNS;

if (isCustomCLNS) {
    // User wants different sizes
    frontCLNS = getValInFeet('CLNS_Front');
    backCLNS = getValInFeet('CLNS_Back');
} else {
    // Standard symmetric mode
    let standardCLNS = getValInFeet('CLNS');
    frontCLNS = standardCLNS;
    backCLNS = standardCLNS;
}

// Now, wherever your code used `CLNS` for calculating the starting point (Pole 1), use `frontCLNS`.
// Wherever your code calculated the total space taken by cantilevers (like 2 * CLNS), 
// replace it with `(frontCLNS + backCLNS)`.
    const RaftCalMode = document.getElementById('RafFullPVEdge').value; 
    const RaftCalVal = getValInFeet('RaftCalVal');
    const ColQtyEW = parseFloat(document.getElementById('ColQtyEW').value) || 0;
    const CLEW = getValInFeet('CLEW');

    // Foundation
    const isFoundation = document.getElementById('FoundationCheck').checked;
    const fSize = document.getElementById('FoundSize').value;
    const fSpec = document.getElementById('FoundSpec').value;
    const foundSize = fSize ? fSize.trim() : "-";
    const foundSpec = fSpec ? fSpec.trim() : "-";

    const TPSize = getValInFeet('TPSize');
    const TPThick = getValInFeet('TPThick');
    const isTPVisible = !document.getElementById('TopPlateSection').classList.contains('hidden');
    let TPSpec = "";
    if(isTPVisible) {
        TPSpec = `${document.getElementById('TPSize').value}"x${document.getElementById('TPSize').value}" x ${getRawInputStr('TPThick')}`;
        if (TPSize > 0) { ColH = TPSize; ColW = TPSize; }
    }

    // --- FIX START: DYNAMIC PANEL LOGIC ---
    const mmToFt = 1 / 304.8;
    let PL, PW;
    let PanelWattageStr = "";
    let PanelWattageNum = 0;

    // 1. Look for the selected panel in your Database
    // Note: panelData comes from Database.js
    const match = (typeof panelData !== 'undefined') ? panelData.find(p => p.name === PModInput) : null;

    if (match) {
        // FOUND: Load data from Database
        PL = match.len * mmToFt;
        PW = match.wid * mmToFt;
        PanelWattageStr = match.name;
        PanelWattageNum = match.watt;
    } 
    else {
        // NOT FOUND: Use Custom Mode logic
        PL = getValInFeet('CustPL'); 
        PW = getValInFeet('CustPW'); 
        
        const wInput = document.getElementById('CustWatt').value;
        PanelWattageNum = parseFloat(wInput) || 0;
        PanelWattageStr = wInput ? wInput + "W" : "Custom";
    }

    // CALCULATE KW CAPACITY
    const totalPanels = PVQtyNS * PVQtyEW;
    const SystemCapacityKW = (PanelWattageNum * totalPanels) / 1000;
    // --- FIX END ---


    // 3. WALKWAY PROCESSING
    let sumHoriSz = 0, countHori = 0, horiSizes = [];
    let sumVertiSz = 0, countVerti = 0, vertiSizes = [];

    if (typeof walkwayList !== 'undefined') {
        walkwayList.forEach(w => {
            if(w.type === 'horizontal') {
                sumHoriSz += w.size; countHori++; horiSizes.push(w.size);
            } else {
                sumVertiSz += w.size; countVerti++; vertiSizes.push(w.size);
            }
        });
    }
    let WWHoriSz = countHori > 0 ? (sumHoriSz / countHori) : 0;
    let WWHoriQty = countHori;
    let WWVertiSz = countVerti > 0 ? (sumVertiSz / countVerti) : 0;
    let WWVertiQty = countVerti;

    let WWHoriSpec = "";
    if(countHori > 0) {
        const allSame = horiSizes.every(v => v === horiSizes[0]);
        WWHoriSpec = allSame ? `${horiSizes[0]} ft` : `Mixed: ${horiSizes.join(', ')} ft`;
    }
    let WWVertiSpec = "";
    if(countVerti > 0) {
        const allSame = vertiSizes.every(v => v === vertiSizes[0]);
        WWVertiSpec = allSame ? `${vertiSizes[0]} ft` : `Mixed: ${vertiSizes.join(', ')} ft`;
    }

    // 4. CORE MATH
    const Rads = TiltA * (Math.PI / 180);
    const SinTilt = Math.sin(Rads);
    const CosTilt = Math.cos(Rads);
    let RafPurH = (RafH + PurH) * CosTilt;

    let FinalRafLen = 0, FinalPurLen = 0;
    let SlopeLen = 0, WidthLen = 0;
    let calcCutSzPVhole = 0, calcCutSz = 0;
    let DiaCalc = 0;

    if (Orient === "Portrait") {
        let RawSlope = (PL * PVQtyNS) + (PVGapNS * (PVQtyNS - 1)) + (WWHoriSz * WWHoriQty) - (PVGapNS * WWHoriQty);
        let RawWidth = (PW * PVQtyEW) + (PVGapEW * (PVQtyEW - 1)) + (WWVertiSz * WWVertiQty) - (PVGapEW * WWVertiQty);
        SlopeLen = RawSlope; WidthLen = RawWidth;

        let PVholeStart = ((PL - PVhole) / 2) - (PurW / 2);
        
        if (RaftCalMode === "RafExt") {
            FinalRafLen = RawSlope - ((PVholeStart - RaftCalVal) * 2);
            calcCutSzPVhole = PVholeStart; calcCutSz = RaftCalVal;        
        } else if (RaftCalMode === "RaftCutPurEdge") {
            FinalRafLen = RawSlope - (PVholeStart * 2);
            calcCutSzPVhole = PVholeStart; calcCutSz = 0;
        } else {
            FinalRafLen = RawSlope; calcCutSzPVhole = 0; calcCutSz = 0; 
        }
        FinalPurLen = RawWidth; DiaCalc = ColH / CosTilt;

    } else {
        let RawSlope = (PW * PVQtyNS) + (PVGapNS * (PVQtyNS - 1)) + (WWHoriSz * WWHoriQty) - (PVGapNS * WWHoriQty);
        let RawWidth = (PL * PVQtyEW) + (PVGapEW * (PVQtyEW - 1)) + (WWVertiSz * WWVertiQty) - (PVGapEW * WWVertiQty);
        SlopeLen = RawSlope; WidthLen = RawWidth;

        let PVholeStart = ((PL - PVhole) / 2) - (PurW / 2);
        
        if (RaftCalMode === "RafExt") {
            FinalRafLen = RawWidth - ((PVholeStart - RaftCalVal) * 2);
            calcCutSzPVhole = PVholeStart; calcCutSz = RaftCalVal;
        } else if (RaftCalMode === "RaftCutPurEdge") {
            FinalRafLen = RawWidth - (PVholeStart * 2);
            calcCutSzPVhole = PVholeStart; calcCutSz = 0;
        } else {
            FinalRafLen = RawWidth; calcCutSzPVhole = 0; calcCutSz = 0;
        }
        FinalPurLen = RawSlope; DiaCalc = ColW / CosTilt;
    }

    let DistFront = calcCutSzPVhole - calcCutSz; 
    if (Orient === "Landscape") DistFront = 0; 
    
    let FstPoleCalc1 = (DistFront * SinTilt) + SFH - RafPurH;
    if(isTPVisible) FstPoleCalc1 -= TPThick;

    // --- FIXED: Use frontCLNS instead of CLNS ---
    let FstPoleCalc2 = frontCLNS + DiaCalc; 
    let FstPoleH = FstPoleCalc1 + (FstPoleCalc2 * SinTilt);

    let SlopeSpan = SlopeLen - (calcCutSzPVhole * 2) + (calcCutSz * 2);
    if (Orient === "Landscape") SlopeSpan = SlopeLen;
    
    // --- FIXED: Use (frontCLNS + backCLNS) instead of (CLNS * 2) ---
    let LastPoleCalc1 = SlopeSpan - (frontCLNS + backCLNS) - DiaCalc; 
    let LastPoleH = (LastPoleCalc1 * SinTilt) + FstPoleH;
    let SBH = (SlopeLen * SinTilt) + SFH;
    let GapFact = LastPoleH - FstPoleH;
    let PtoPNS = (ColQtyNS > 1) ? Math.sqrt(Math.pow(LastPoleCalc1, 2) - Math.pow(GapFact, 2)) / (ColQtyNS - 1) : 0;
    
    let EW_Beam_Len = (Orient === "Portrait") ? FinalPurLen : FinalRafLen;
    let RafMidUse = (Orient === "Portrait") ? RafW : RafH; 
    let PurDistCalc = EW_Beam_Len - (CLEW * 2);
    let PtoPEW = (ColQtyEW > 1) ? (PurDistCalc - RafMidUse) / (ColQtyEW - 1) : 0;

    let PurlinQty = (Orient==="Portrait"?PVQtyNS:PVQtyEW)*2;
    let RafterQty = (Orient==="Landscape"?ColQtyNS:ColQtyEW);

    let resHTML = `
        <div class="result-box"><span class="result-label">Rafter Length:</span><span class="result-value">${formatOutput(FinalRafLen)}</span></div>
        <div class="result-box"><span class="result-label">Purlin Length:</span><span class="result-value">${formatOutput(FinalPurLen)}</span></div>
        <div class="result-box"><span class="result-label">Structure Front Height:</span><span class="result-value">${formatOutput(SFH)}</span></div>
        <div class="result-box"><span class="result-label">Structure Back Height:</span><span class="result-value">${formatOutput(SBH)}</span></div>
        <div class="result-box"><span class="result-label">Column / Pole Spacing (N–S):</span><span class="result-value">${formatOutput(PtoPNS)}</span></div>
        <div class="result-box"><span class="result-label">Column / Pole Spacing (E-W):</span><span class="result-value">${formatOutput(PtoPEW)}</span></div>
        <div class="result-box"><span class="result-label">Purlin Qty:</span><span class="result-value">${PurlinQty}</span></div>
        <div class="result-box"><span class="result-label">Rafter Qty:</span><span class="result-value">${RafterQty}</span></div>
        <div class="result-box" style="background:#e8f5e9;"><span class="result-label">Total System Capacity:</span><span class="result-value">${SystemCapacityKW.toFixed(2)} KW</span></div>
    `;
    document.getElementById('results-container').innerHTML = resHTML;

    let tableHTML = "";
    let poleData = [];
    poleData.push({id:1, val: FstPoleH});
    if (ColQtyNS > 1) {
        let step = (LastPoleH - FstPoleH) / (ColQtyNS - 1);
        for(let i=1; i<ColQtyNS; i++) poleData.push({id: i+1, val: FstPoleH + (step*i)});
    }
    poleData.forEach(p => {
        tableHTML += `<tr><td>Vertical Support (Column/Pole)-${p.id}</td><td>${formatOutput(p.val)}</td></tr>`;
    });
    document.querySelector('#poleTable tbody').innerHTML = tableHTML;

    window.lastBOMResults = {
        CustName, CustLoc, CompName,
        // *** CRITICAL FIX HERE ***
        PMod: PanelWattageStr,      // Force "550W" so PDF sees text
        SystemCapacityKW,           // Save Calculated KW
        // *************************
        PL, PW, Orient,
        PurProfileText: document.getElementById('PurProfile').options[document.getElementById('PurProfile').selectedIndex]?.text,
        RafProfileText: document.getElementById('RafProfile').options[document.getElementById('RafProfile').selectedIndex]?.text,
        ColProfileText: document.getElementById('ColProfile').options[document.getElementById('ColProfile').selectedIndex]?.text,
        FinalRafLen, FinalPurLen, SFH, SBH, PtoPNS, PtoPEW,
        PurlinQty, RafterQty, poleData,
        ColQtyEW, ColQtyNS,
        isTPVisible, TPSpec,
        WWHoriQty, WWHoriSz: sumHoriSz, WWHoriSpec, 
        WWVertiQty, WWVertiSz: sumVertiSz, WWVertiSpec,
        RawSlope: SlopeLen, RawWidth: WidthLen, 
        TiltA, frontCLNS, backCLNS, CLNS: frontCLNS, PVGapNS, PVGapEW, walkwayList,
        PVQtyNS, PVQtyEW, RafH, PurH, 
        ColW, ColH, ProjectNotes: notesVal,
        isFoundation, foundSize, foundSpec
    };
    localStorage.setItem('solarBOMData', JSON.stringify(window.lastBOMResults));
}
// Corrected Auto-load notes on page refresh
window.addEventListener('load', () => {
    const rawData = localStorage.getItem('solarBOMData');
    if (rawData) {
        try {
            const data = JSON.parse(rawData);
            // Ensure we are grabbing the text property, not the whole object
            if (data && typeof data.ProjectNotes === 'string') {
                document.getElementById('ProjectNotes').value = data.ProjectNotes;
            } else {
                document.getElementById('ProjectNotes').value = ""; // Keep it empty if no notes
            }
        } catch (e) {
            console.error("Error loading notes:", e);
        }
    }
});