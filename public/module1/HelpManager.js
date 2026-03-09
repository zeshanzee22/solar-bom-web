/* HelpManager.js FIXED */

const sectionHelpAssets = {
    'panel-info': 'assets/help/panel_info.gif',
    'array-config': 'assets/help/array_config.gif',
    'profiles': 'assets/help/profiles.gif',
    'height-angle': 'assets/help/height_angle.gif',
    'support-setup': 'assets/help/support_setup.gif',
    'walkway-manager': 'assets/help/walkway_manager.gif',
    'rafter-cut-mode': 'assets/help/rafter_cut.gif'
};

window.addEventListener('DOMContentLoaded', () => {
    const helpBox = document.createElement('div');
    helpBox.id = 'help-modal-container';
    
    // 1. INIT: Start Hidden (display: none)
    helpBox.style.cssText = `
        position: fixed;
        display: none; 
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        background: #fff;
        border: 2px solid #333;
        border-radius: 8px;
        box-shadow: 0 0 500px rgba(0,0,0,0.5);
        padding: 0;
        width: 80%;       
        max-width: 800px;
        max-height: 90vh;     
        overflow-y: auto;     
        flex-direction: column; /* Ready for when we switch to flex */
    `;

    const header = document.createElement('div');
    header.style.cssText = "background:#333; color:#fff; padding:10px; display:flex; justify-content:space-between; align-items:center;";
    header.innerHTML = '<span style="font-weight:bold;">Help Guide</span> <button onclick="hideHelp()" style="background:red; color:white; border:none; padding:5px 10px; cursor:pointer; font-weight:bold;">X</button>';

    const imgContainer = document.createElement('div');
    imgContainer.style.padding = "10px";
    
    const helpImg = document.createElement('img');
    helpImg.id = 'help-modal-img';
    helpImg.style.cssText = 'width: 100%; height: auto; display: block;';
    
    imgContainer.appendChild(helpImg);
    helpBox.appendChild(header);
    helpBox.appendChild(imgContainer);
    document.body.appendChild(helpBox);

    document.addEventListener('click', (e) => {
        if (e.target.id === 'help-modal-container') hideHelp();
    });
});

function showHelp(sectionKey) {
    const helpBox = document.getElementById('help-modal-container');
    const helpImg = document.getElementById('help-modal-img');
    const asset = sectionHelpAssets[sectionKey];

    if (asset) {
        helpImg.src = asset;
        // 2. TRIGGER: Switch to Flex when opening
        helpBox.style.display = 'flex'; 
    }
}

function hideHelp() {
    const helpBox = document.getElementById('help-modal-container');
    // 3. CLOSE: Switch back to None
    helpBox.style.display = 'none'; 
    document.getElementById('help-modal-img').src = ""; 
}