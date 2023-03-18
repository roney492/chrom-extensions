
document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById('send-data');
  button.addEventListener('click', function () {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].url.startsWith("https://app.jobsoid.com/App/#/Jobs/") || tabs[0].url.startsWith("https://app.jobsoid.com/App/#/Candidates")) {
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

      }
      else {
        alert("You need to be on the Candidates or Jobs -> Candidates page.");
      }
    });

  })

  const scoreButton = document.getElementById('show-score');
  scoreButton.addEventListener('click', function () {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].url.startsWith("https://app.jobsoid.com/App/#/Jobs/")) {

        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: injectedJavascriptScore
          }, results => {

          });
        });

      } else {
        alert("You need to be on the Jobs -> Candidates page.");
      }
    });

  })

  const rndButton = document.getElementById('open-rnd');
  rndButton.addEventListener('click', function () {
    chrome.tabs.create({
      url: 'rnd.html'
    });
  })
});


function injectedFunction() {
  var dataItems = [];

  const checkboxes = document.querySelectorAll('.list-group-item.item-checkbox.list-group-main input[type="checkbox"]');
  for (let i = 0; i < checkboxes.length; i++) {    
      const anchor = checkboxes[i].parentNode.querySelector('a.title');
      if (checkboxes[i].checked) {
        dataItems.push(anchor.getAttribute('href').split('/').slice(-2)[0]);
      }
  }
  return dataItems;
  
}


function injectedJavascriptScore() {
  var s = "#appUiView > div.container-fluid > div > div.row > div > div.tab-content.no-border.no-padding > div > div.row > div.col-md-18 > div > div.list-group.candidates.m-space.no-border.list-group-min-height.k-widget.k-listview >";
  var elements = document.querySelectorAll(s + " div");
  for (let i = 0; i < elements.length; i++) {
    let link = elements[i].querySelector(s + " div:nth-child(" + (i + 1) + ") > div > div.col-sm-17.col-xs-17 > div.entity > a");
    let span = elements[i].querySelector(s + " div:nth-child(" + (i + 1) + ") > div > div.col-sm-2.text-right.hidden-xs > div > div.tooltip > div > div:nth-child(2) > span");
    let spanDuplicate = span.cloneNode(true);
    spanDuplicate.style.cssText = "font-size: 18px !important; background-color: " + (span.textContent === "0" ? "red" : span.textContent <= 200 ? "#FFCCCB" : span.textContent < 300 ? "#FFD580" : span.textContent < 400 ? "lightyellow" : span.textContent < 500 ? "lightgreen" : "lightblue") + "; border: 1px solid grey; border-radius: 3px; padding-left: 2px; padding-right: 2px; margin-left: 4px;";
    link.appendChild(spanDuplicate);
  }
  return true;
}