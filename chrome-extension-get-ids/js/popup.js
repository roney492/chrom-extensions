
document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById('send-data');
  button.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: injectedFunction
      }, results => {
        console.log(results[0].result);

        var jobsoidData = results[0].result;

        chrome.tabs.create({
          url: 'index.html?data=' + encodeURIComponent(JSON.stringify(jobsoidData))
        });
      });
    });
  })
});


function injectedFunction() {
  var dataItems = [];
  document.querySelectorAll('input[type="checkbox"]:checked').forEach(function (checkbox) {
    var element = checkbox.closest('[data-uid]').querySelector('a[href*="/Candidates/"]');
    dataItems.push(element.getAttribute('href').split('/').slice(-2)[0]);
  });
  return dataItems;
}