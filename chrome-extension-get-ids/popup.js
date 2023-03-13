// Get the button element
const sendButton = document.getElementById('send-data');
const dataItems = [];
// Add a click listener to the button
sendButton.addEventListener('click', () => {
    // Get the selected checkbox elements
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(function (checkbox) {
            var dataItem = checkbox.closest('[data-uid]');
            var candidateLink = dataItem.querySelector('a[href*="/Candidates/"]');
            var candidateId = candidateLink.getAttribute('href').split('/').slice(-2)[0];
            dataItems.push(candidateId);
        });
    // Send the dataItems to the background script
    chrome.runtime.sendMessage({
        action: 'sendDataItems',
        dataItems: dataItems
    });
});