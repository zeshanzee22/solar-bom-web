// units.js
// Handles all unit conversions for the Solar CAD

const Units = {
    // Convert mm (from database) to whatever the panel UI dropdown is set to
    mmToTarget: function(mm, targetUnit) {
        switch(targetUnit) {
            case 'mm': return mm;
            case 'cm': return mm / 10;
            case 'm':  return mm / 1000;
            case 'in': return mm / 25.4;
            case 'ft': return mm / 304.8;
            default:   return mm / 25.4; // Default inches
        }
    },
    // The drawing engine ALWAYS needs inches to draw correctly.
    // This converts the UI input box back to inches.
    toInches: function(val, currentUnit) {
        switch(currentUnit) {
            case 'mm': return val / 25.4;
            case 'cm': return val / 2.54;
            case 'm':  return val * 39.3701;
            case 'in': return val;
            case 'ft': return val * 12;
            default:   return val;
        }
    },
    formatVal: function(val) {
        return parseFloat(val.toFixed(2));
    },
    // Helper used by fixdraw.js and elevateddraw.js to fetch panel size
    getPanelDimsInInches: function() {
        const valL = parseFloat(document.getElementById('p-len').value) || 0;
        const valW = parseFloat(document.getElementById('p-wid').value) || 0;
        const unit = document.getElementById('panel-unit').value || 'in';
        return {
            l: this.toInches(valL, unit),
            w: this.toInches(valW, unit)
        };
    }
};