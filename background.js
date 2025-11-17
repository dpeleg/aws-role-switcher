// background.js

// 1. Listen for messages sent from the popup (popup.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    // Check if the message is the 'SWITCH_ROLE' command
    if (message.command === 'SWITCH_ROLE') {
        
        const profileData = message.profile;
        const targetUrlPattern = "https://*.signin.aws.amazon.com/switchrole*";
        const defaultSwitchRoleUrl = "https://signin.aws.amazon.com/switchrole";

        // Step 1: Find the existing AWS Switch Role tab
        chrome.tabs.query({ url: targetUrlPattern }, (tabs) => {
            
            if (tabs.length > 0) {
                // If a tab is found (tabs[0] is the first one found)
                const targetTabId = tabs[0].id;

                // A. Focus the existing tab
                chrome.tabs.update(targetTabId, { active: true }, () => {
                    // B. Inject the content script and send the role data
                    executeScriptAndSendRole(targetTabId, profileData);
                });

            } else {
                // If no tab is found
                
                // A. Open a new tab with the default Switch Role URL
                chrome.tabs.create({ url: defaultSwitchRoleUrl }, (newTab) => {
                    // B. Wait for the new tab to finish loading
                    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                        if (tabId === newTab.id && changeInfo.status === 'complete') {
                            // C. Remove the listener to avoid running multiple times
                            chrome.tabs.onUpdated.removeListener(listener); 
                            
                            // D. Inject the content script and send the role data
                            executeScriptAndSendRole(newTab.id, profileData);
                        }
                    });
                });
            }
        });

        // Return true to indicate we will send an asynchronous response (required for async calls like chrome.tabs.query)
        return true; 
    }
});

/**
 * Executes the content script in the target tab and sends the role data for form filling.
 * @param {number} tabId - The ID of the target AWS tab.
 * @param {object} profileData - The selected profile object (accountID, roleName, etc.).
 */
function executeScriptAndSendRole(tabId, profileData) {
    // Inject content.js into the target tab
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
    }, () => {
        // After content.js is successfully injected, send the profile data to it
        chrome.tabs.sendMessage(tabId, {
            command: 'FILL_FORM',
            profile: profileData
        });
    });
}