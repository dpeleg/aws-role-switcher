document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const importButton = document.getElementById('import-button');
    const statusMessage = document.getElementById('status-message');

    let rawFileContent = null;
    let fileType = null;

    // Enable the import button when a file is selected
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileType = file.name.split('.').pop().toLowerCase();
            importButton.disabled = false;
            statusMessage.textContent = `File selected: ${file.name}. Click Import.`;

            const reader = new FileReader();
            reader.onload = (e) => {
                rawFileContent = e.target.result;
            };
            reader.readAsText(file);
        } else {
            importButton.disabled = true;
            statusMessage.textContent = 'Awaiting file selection...';
        }
    });

    // Handle the import button click
    importButton.addEventListener('click', () => {
        if (!rawFileContent) {
            setStatus('error', 'No file content loaded.');
            return;
        }

        let profiles;
        try {
            if (fileType === 'json') {
                profiles = JSON.parse(rawFileContent);
            } else if (fileType === 'csv') {
                profiles = parseCSV(rawFileContent);
            } else {
                setStatus('error', 'Unsupported file type. Please use JSON or CSV.');
                return;
            }

            // Basic validation: ensure it's an array and has required fields
            if (!Array.isArray(profiles) || profiles.length === 0 || !validateProfiles(profiles)) {
                throw new Error('Invalid profile structure. Check for required fields.');
            }
            
        } catch (e) {
            setStatus('error', `Parsing failed: ${e.message}`);
            return;
        }

        // Save the valid profiles to Chrome storage
        chrome.storage.local.set({ 'awsProfiles': profiles }, () => {
            if (chrome.runtime.lastError) {
                setStatus('error', `Storage error: ${chrome.runtime.lastError.message}`);
            } else {
                setStatus('success', `Successfully imported ${profiles.length} profiles!`);
                importButton.disabled = true;
            }
        });
    });
    
    /**
     * Parses CSV content into an array of objects.
     * Assumes the first row is headers.
     */
    function parseCSV(csvText) {
        const [headers, ...rows] = csvText.trim().split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/"/g, '')));
        return rows.map(row => 
            row.reduce((obj, cell, index) => {
                obj[headers[index]] = cell;
                return obj;
            }, {})
        );
    }
    
    /**
     * Validates that all required fields are present in the profile objects.
     */
    function validateProfiles(profiles) {
        const requiredFields = ['accountID', 'roleName', 'displayName'];
        return profiles.every(profile => 
            requiredFields.every(field => profile.hasOwnProperty(field) && profile[field])
        );
    }

    /**
     * Updates the status message on the page.
     */
    function setStatus(type, message) {
        statusMessage.textContent = message;
        statusMessage.className = (type === 'success' ? 'success' : 'error');
    }
});