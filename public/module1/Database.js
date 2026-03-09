// --- PROFILE DATABASE (Purlins, Rafters, Columns) ---
const purlinData = [
    {cat:"Custom / Manual Entry", h:0, w:0},
    {cat:"C-Channel", h:3, w:1.5}, {cat:"C-Channel", h:4, w:2}, {cat:"C-Channel", h:5, w:2}, {cat:"C-Channel", h:6, w:2.5}, {cat:"C-Channel", h:8, w:3},
    {cat:"Square Pipe", h:1.5, w:1.5}, {cat:"Square Pipe", h:2, w:2}, {cat:"Square Pipe", h:2.5, w:2.5}, {cat:"Square Pipe", h:3, w:3}, {cat:"Square Pipe", h:4, w:4},
    {cat:"Rectangular Pipe", h:2, w:1}, {cat:"Rectangular Pipe", h:3, w:1.5}, {cat:"Rectangular Pipe", h:3, w:2}, {cat:"Rectangular Pipe", h:4, w:2},
    {cat:"Z-Purlin", h:4, w:2}, {cat:"Z-Purlin", h:6, w:2.5}, {cat:"Z-Purlin", h:8, w:3},
    {cat:"U-Channel", h:1.5, w:1.5}, {cat:"U-Channel", h:3, w:1.5},
    {cat:"I-Beam Girder", h:4, w:2}, {cat:"I-Beam Girder", h:4.5, w:2.5}, {cat:"I-Beam Girder", h:4.75, w:2.5}, {cat:"I-Beam Girder", h:5, w:2.5}, {cat:"I-Beam Girder", h:5, w:3},
    {cat:"I-Beam Girder", h:6, w:3}, {cat:"I-Beam Girder", h:6, w:4}, {cat:"I-Beam Girder", h:7, w:3}, {cat:"I-Beam Girder", h:7, w:3.5}, {cat:"I-Beam Girder", h:8, w:4}, {cat:"I-Beam Girder", h:9, w:4.5}, {cat:"I-Beam Girder", h:10, w:5}
];

const rafterData = [
    {cat:"Custom / Manual Entry", h:0, w:0},
    {cat:"I-Beam Girder", h:4, w:2}, {cat:"I-Beam Girder", h:4.5, w:2.5}, {cat:"I-Beam Girder", h:4.75, w:2.5},{cat:"I-Beam Girder", h:5, w:2.5},{cat:"I-Beam Girder", h:5, w:3},
    {cat:"I-Beam Girder", h:6, w:3}, {cat:"I-Beam Girder", h:6, w:4}, {cat:"I-Beam Girder", h:7, w:3}, {cat:"I-Beam Girder", h:7, w:3.5}, {cat:"I-Beam Girder", h:8, w:4}, {cat:"I-Beam Girder", h:9, w:4.5}, {cat:"I-Beam Girder", h:10, w:5},
    {cat:"Square Pipe", h:1.5, w:1.5}, {cat:"Square Pipe", h:2, w:2}, {cat:"Square Pipe", h:2.5, w:2.5}, {cat:"Square Pipe", h:3, w:3}, {cat:"Square Pipe", h:4, w:4},
    {cat:"Rectangular Pipe", h:2, w:1}, {cat:"Rectangular Pipe", h:3, w:1.5}, {cat:"Rectangular Pipe", h:3, w:2}, {cat:"Rectangular Pipe", h:4, w:2},
    {cat:"C-Channel", h:3, w:1.5}, {cat:"C-Channel", h:4, w:2}, {cat:"C-Channel", h:5, w:2}, {cat:"C-Channel", h:6, w:2.5}, {cat:"C-Channel", h:8, w:3},
    {cat:"U-Channel", h:1.5, w:1.5}, {cat:"U-Channel", h:3, w:1.5}
];

const columnData = [
    {cat:"Custom / Manual Entry", h:0, w:0},
    {cat:"I-Beam Girder", h:4, w:2}, {cat:"I-Beam Girder", h:4.5, w:2.5}, {cat:"I-Beam Girder", h:4.75, w:2.5}, {cat:"I-Beam Girder", h:5, w:2.5}, {cat:"I-Beam Girder", h:5, w:3},
    {cat:"I-Beam Girder", h:6, w:3}, {cat:"I-Beam Girder", h:6, w:4}, {cat:"I-Beam Girder", h:7, w:3}, {cat:"I-Beam Girder", h:7, w:3.5}, {cat:"I-Beam Girder", h:8, w:4}, {cat:"I-Beam Girder", h:9, w:4.5}, {cat:"I-Beam Girder", h:10, w:5},
    {cat:"Round Pipe", h:1.5, w:1.5}, {cat:"Round Pipe", h:2, w:2}, {cat:"Round Pipe", h:2.5, w:2.5}, {cat:"Round Pipe", h:3, w:3},
    {cat:"Round Pipe", h:3.5, w:3.5}, {cat:"Round Pipe", h:4, w:4}, {cat:"Round Pipe", h:5, w:5}, {cat:"Round Pipe", h:6, w:6},
    {cat:"Round Pipe", h:7.5, w:7.5}, {cat:"Round Pipe", h:8, w:8}, {cat:"Round Pipe", h:10, w:10},
    {cat:"Square Pipe", h:1.5, w:1.5}, {cat:"Square Pipe", h:2, w:2}, {cat:"Square Pipe", h:2.5, w:2.5}, {cat:"Square Pipe", h:3, w:3}, {cat:"Square Pipe", h:4, w:4},
    {cat:"Rectangular Pipe", h:2, w:1}, {cat:"Rectangular Pipe", h:3, w:1.5}, {cat:"Rectangular Pipe", h:3, w:2}, {cat:"Rectangular Pipe", h:4, w:2},
    {cat:"C-Channel", h:3, w:1.5}, {cat:"C-Channel", h:4, w:2}, {cat:"C-Channel", h:5, w:2}, {cat:"C-Channel", h:6, w:2.5}, {cat:"C-Channel", h:8, w:3},
    {cat:"U-Channel", h:1.5, w:1.5}, {cat:"U-Channel", h:3, w:1.5}
];

// --- SOLAR PANEL DATABASE (NEW) ---
// YOU CAN EDIT DIMENSIONS HERE WITHOUT TOUCHING HTML
const panelData = [
    { name: "545W", len: 2256, wid: 1133, watt: 545 },
    { name: "585W", len: 2278, wid: 1134, watt: 585 },
    { name: "615W", len: 2384, wid: 1134, watt: 615 },
    { name: "700W", len: 2384, wid: 1303, watt: 700 }
];

// Helper functions to fill dropdowns
function populateSelect(id, data) {
    const sel = document.getElementById(id);
    if(!sel) return;
    sel.innerHTML = '';
    data.forEach(item => {
        const opt = document.createElement('option');
        if(item.cat === "Custom / Manual Entry") {
            opt.text = item.cat;
            opt.value = "";
        } else {
            let text = `${item.cat} | ${item.h}"`;
            if(item.cat !== "Round Pipe") text += ` x ${item.w}"`;
            opt.value = `${item.h},${item.w},${item.cat}`; 
            opt.text = text;
        }
        sel.appendChild(opt);
    });
}

function populatePanelSelect() {
    const sel = document.getElementById('PMod');
    if(!sel) return;
    sel.innerHTML = '';
    
    // Add panels from database
    panelData.forEach((panel, index) => {
        const opt = document.createElement('option');
        opt.value = panel.name;
        opt.text = panel.name;
        if(index === 0) opt.selected = true; // Select first by default
        sel.appendChild(opt);
    });

    // Add Custom option at the end
    const customOpt = document.createElement('option');
    customOpt.value = "Custom";
    customOpt.text = "Custom Dimensions...";
    sel.appendChild(customOpt);
}

function initDropdowns() {
    populateSelect('PurProfile', purlinData);
    populateSelect('RafProfile', rafterData);
    populateSelect('ColProfile', columnData);
    populatePanelSelect();
    
    // Auto-select the first panel logic on load
    if(typeof toggleCustomPanel === 'function') toggleCustomPanel(); 
}

window.addEventListener('DOMContentLoaded', initDropdowns);