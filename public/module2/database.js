// database.js
// Centralized configuration for Solar Panels

// Global Configuration
const GLOBAL_CONFIG = {
    PPI: 10 / 12, // 10 pixels per foot (Default)
};

// Panel Database
const PANEL_DB = {
    // Format: key: { wattage, l: length(mm), w: width(mm), label: "Display Name" }
    p545: { wattage: 540, l: 2256, w: 1133, label: "545W" },
    p585: { wattage: 585, l: 2278, w: 1134, label: "585W" },
    p600: { wattage: 600, l: 2384, w: 1134, label: "600W" },
    p700: { wattage: 700, l: 2384, w: 1303, label: "700W+" }
};

// Helper to get panel list for Dropdown
function getPanelOptions() {
    return Object.keys(PANEL_DB).map(key => ({
        value: key,
        label: PANEL_DB[key].label + ` (${PANEL_DB[key].l}mm x ${PANEL_DB[key].w}mm)`
    }));
}