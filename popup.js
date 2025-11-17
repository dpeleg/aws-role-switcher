document.addEventListener('DOMContentLoaded', () => {
    const profileList = document.getElementById('profile-list');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');

    // 1. Fetch profiles from Chrome Local Storage
    chrome.storage.local.get(['awsProfiles'], (result) => {
        
        // Hide the loading message once we have results (or lack thereof)
        loadingMessage.style.display = 'none';

        const profiles = result.awsProfiles || [];

        if (profiles.length === 0) {
            // Display an error/note if no profiles are found
            errorMessage.textContent = 'No AWS profiles found. Please import or configure them.';
            errorMessage.classList.remove('hidden');
            return;
        }

        // 2. Render the profile list
        profiles.forEach(profile => {
            const listItem = document.createElement('li');
            
            // Set the display name for the user
            listItem.textContent = profile.displayName; 
            
            // Store the entire profile object as a data attribute (encoded JSON) for easy retrieval
            // We use JSON.stringify because data attributes can only store strings
            listItem.dataset.profile = JSON.stringify(profile); 
            
            // Optional: Apply the color to the list item based on the profile data
            // We'll use the color name (e.g., 'Red', 'Blue') to assign a CSS class for styling
            if (profile.color) {
                listItem.classList.add(`color-${profile.color.toLowerCase()}`);
            }

            profileList.appendChild(listItem);
        });

        // Show the list now that it's populated
        profileList.style.display = 'block';

        // 3. Attach the click handler to the list
        profileList.addEventListener('click', handleProfileClick);
    });
});


/**
 * Handles the click event on a profile list item.
 * @param {Event} event - The click event object.
 */
function handleProfileClick(event) {
    const listItem = event.target.closest('li');

    // Ensure we clicked on a list item
    if (listItem && listItem.dataset.profile) {
        
        // Decode the profile object from the data attribute
        const profile = JSON.parse(listItem.dataset.profile);
        
        // 4. Send the SWITCH_ROLE command and the profile data to the background script
        chrome.runtime.sendMessage({
            command: 'SWITCH_ROLE',
            profile: profile
        }, (response) => {
            // Optional: Handle confirmation response from background script
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError.message);
            }
            // Close the popup window immediately after sending the message
            window.close();
        });
    }
}