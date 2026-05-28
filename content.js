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
            
            // Step 3 & 4: Handle the color dropdown, then submit
            // The color selection is asynchronous, so we must submit the form
            // inside a callback to ensure it happens after the color is chosen.
            if (profile.color) {
                selectColorOption(profile.color, clickSwitchRoleButton);
            } else {
                clickSwitchRoleButton();
            }

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
 * @param {function} callback - Function to execute after the color is selected.
 */
function selectColorOption(colorName, callback) {
    // 1. Map to valid AWS colors. AWS strictly expects one of these exact values.
    const validColors = ['None', 'Red', 'Orange', 'Yellow', 'Green', 'Blue'];
    let targetColor = validColors.find(c => c.toLowerCase() === colorName.toLowerCase());
    
    // If an unsupported color (like 'Purple') is passed, gracefully fallback to 'None'
    if (!targetColor) {
        console.warn(`Color '${colorName}' is not natively supported by AWS. Falling back to 'None'.`);
        targetColor = 'None';
    }
    // 2. Find and click the color picker button to open the dropdown
    const colorButton = document.getElementById('color');
    if (!colorButton) {
        console.warn("Color picker button not found.");
        if (callback) {
            callback();
        }
        return;
    }
    
    // Check if the dropdown is already open (avoid double-clicking)
    if (colorButton.getAttribute('aria-expanded') !== 'true') {
        colorButton.click();
    }

    // Create a slightly longer delay for the React portal dropdown to render
    setTimeout(() => {
        // 3. Find the specific color option
        const options = Array.from(document.querySelectorAll('li, [role="option"]'));
        let colorOptionListItem = options.find(opt => {
            const hasTitle = opt.querySelector(`span[title="${targetColor}"]`);
            const hasText = opt.textContent.trim().toLowerCase() === targetColor.toLowerCase();
            return hasTitle || hasText;
        });

        if (colorOptionListItem) {
            // Click the list item wrapper
            const clickable = colorOptionListItem.closest('li') || colorOptionListItem;
            clickable.click();
            console.log(`Selected color: ${targetColor}`);
        } else {
            console.warn(`Color option not found for: ${targetColor}`);
        }
        // 4. Proceed to click the Switch Role submit button
        if (callback) callback();
    }, 200); // Increased delay to 200ms to ensure the UI is fully ready
}


/**
 * Clicks the final "Switch Role" button.
 */
function clickSwitchRoleButton() {
    // Attempt to find submit button by its text content
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