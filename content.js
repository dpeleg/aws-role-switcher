// content.js

// 1. Listen for the message sent from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.command === 'FILL_FORM') {
        const profile = request.profile;
        
        // Ensure the function runs only once and has data
        if (!profile) {
            console.error("Content Script received FILL_FORM command but no profile data.");
            return false; 
        }

        console.log("Filling form with profile:", profile.displayName);
        
        try {
            // Step 2: Fill the main text fields
            fillTextField('accountId', profile.accountID);
            fillTextField('roleName', profile.roleName);
            fillTextField('displayName', profile.displayName);
            
            // Step 3: Handle the color dropdown
            if (profile.color && profile.color.toLowerCase() !== 'none') {
                selectColorOption(profile.color);
            }
            
            // Step 4: Click the "Switch Role" button
            clickSwitchRoleButton();

        } catch (error) {
            console.error("Error during form filling:", error);
            alert("Error switching role. AWS form elements may have changed.");
        }
        
        // Return true to indicate the listener will send a response asynchronously, 
        // though we don't strictly send one back here.
        return true; 
    }
});


/**
 * Generic function to fill a standard input field and dispatch events.
 * @param {string} id - The ID of the input element.
 * @param {string} value - The value to set.
 */
function fillTextField(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
        
        // AWS uses React/other frameworks, so setting value directly might not register.
        // We must dispatch synthetic change/input events to make the form recognize the change.
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`Filled ${id}: ${value}`);
    } else {
        console.warn(`Input element not found: #${id}`);
    }
}


/**
 * Handles the AWS color dropdown interaction.
 * @param {string} colorName - The user-friendly color name (e.g., 'Red', 'Blue').
 */
function selectColorOption(colorName) {
    // 1. Find and click the color picker button to open the dropdown
    const colorButton = document.getElementById('color');
    if (!colorButton) {
        console.warn("Color picker button not found.");
        return;
    }
    
    // Check if the dropdown is already open (avoid double-clicking)
    if (!document.querySelector('.awsui_dropdown-content-wrapper_qwoo0_nxdfa_153')) {
        colorButton.click();
    }

    // Give a very slight delay for the dropdown to render, which is sometimes necessary
    setTimeout(() => {
        // 2. Find the specific color option using the title attribute from your provided HTML snippet
        const targetColorTitle = colorName;
        const colorOptionListItem = document.querySelector(`li span[title="${targetColorTitle}"]`).closest('li');
        if (colorOptionListItem) {
            // 3. Click the list item
            colorOptionListItem.click();
            console.log(`Selected color: ${colorName}`);
        } else {
            console.warn(`Color option not found for: ${colorName}`);
        }
    }, 50); // 50ms delay
}


/**
 * Clicks the final "Switch Role" button.
 */
function clickSwitchRoleButton() {
    // Attempt to find the button by its text content, which is safer than IDs that frequently change.
    // The button usually has type="submit".
    const buttons = document.querySelectorAll('button[type="submit"]');
    
    let switchButton = null;

    // Iterate through all submit buttons to find the one containing the text "Switch Role"
    buttons.forEach(button => {
        if (button.textContent.includes('Switch Role')) {
            switchButton = button;
        }
    });

    if (switchButton) {
        // Click the button to submit the form
        switchButton.click();
        console.log("Clicked Switch Role button. Switch initiated.");
    } else {
        console.error("Switch Role button not found!");
    }
}