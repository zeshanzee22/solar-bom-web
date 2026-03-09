/* QuickConverter.js */
function runQuickConv() {
    const val = parseFloat(document.getElementById('quickVal').value) || 0;
    const fromUnit = document.getElementById('quickFrom').value;
    const toUnit = document.getElementById('quickTo').value;
    const display = document.getElementById('quickRes');

    // 1. Define conversion factors to INCHES (Base Unit)
    const toInches = {
        'ft': 12,
        'inch': 1,
        'mm': 1 / 25.4,
        'cm': 1 / 2.54,
        'm': 39.3701,
        'suttar': 0.125
    };

    // 2. Convert Input to Inches
    let valueInInches = val * toInches[fromUnit];

    // 3. Convert from Inches to Target Unit
    let result = 0;
    if (toUnit === 'ft') result = valueInInches / 12;
    else if (toUnit === 'inch') result = valueInInches;
    else if (toUnit === 'mm') result = valueInInches * 25.4;
    else if (toUnit === 'cm') result = valueInInches * 2.54;
    else if (toUnit === 'm') result = valueInInches / 39.3701;
    else if (toUnit === 'suttar') result = valueInInches / 0.125;
    else if (toUnit === 'ft_in') {
        const ft = Math.floor(valueInInches / 12);
        const remainingIn = (valueInInches % 12).toFixed(1);
        display.innerText = `${ft}' ${remainingIn}"`;
        return;
    }

    // 4. Update Display
    display.innerText = result.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3
    });
}