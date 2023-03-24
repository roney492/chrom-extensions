
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
            //console.log(results[0].result);

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

  const selectGood = document.getElementById('select-good');
  selectGood.addEventListener('click', function () {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].url.startsWith("https://app.jobsoid.com/App/#/Jobs/")) {

        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: selectCandidatesWithScoreAbove200
          });
        });

      } else {
        alert("You need to be on the Jobs -> Candidates page.");
      }
    });
  })
  

  const selectBad = document.getElementById('select-bad');
  selectBad.addEventListener('click', function () {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].url.startsWith("https://app.jobsoid.com/App/#/Jobs/")) {

        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: selectCandidatesWithScoreBelow100
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
    // Create a new span element
    let newSpan = document.createElement('span');
    // Set the background color and text content of the new span element based on the value of the existing span element
    newSpan.textContent = span.textContent;
    newSpan.style.cssText = "font-size: 18px !important; background-color: " + (span.textContent === "0" ? "red" : span.textContent <= 80 ? "#F5A9A9" : span.textContent <= 140 ? "#F6CEEC" : span.textContent <= 200 ? "lightyellow" : span.textContent <= 250 ? "lightgreen" : "lightblue") + "; border: 1px solid grey; border-radius: 3px; padding-left: 2px; padding-right: 2px; margin-left: 4px;";
    newSpan.classList.add('assist-score');

    // Add the new span element to the link element
    link.appendChild(newSpan);

  }
  return true;
}

function selectCandidatesWithScoreAbove200() {
  // Get all the list items with the class 'item-checkbox'
  let items = document.querySelectorAll('.item-checkbox');

  // Loop through each list item
  for (let i = 0; i < items.length; i++) {
    // Get the 'assist-score' element within the list item
    let score = items[i].querySelector('.assist-score');
    
    // Check if the score value is greater than 140
    if (score && parseInt(score.textContent) > 140) {
      // Get the checkbox element within the list item
      let checkbox = items[i].querySelector('input[type="checkbox"]');
      
      // Toggle the checkbox's checked state and trigger the click event
      checkbox.click();
    }
  }

  return;
}


function selectCandidatesWithScoreBelow100() {
  // Get all the list items with the class 'item-checkbox'
  let items = document.querySelectorAll('.item-checkbox');

  // Loop through each list item
  for (let i = 0; i < items.length; i++) {
    // Get the 'assist-score' element within the list item
    let score = items[i].querySelector('.assist-score');
    
    // Check if the score value is <= 140
    if (score && parseInt(score.textContent) <= 140 && parseInt(score.textContent) != 0) {
      // Get the checkbox element within the list item
      let checkbox = items[i].querySelector('input[type="checkbox"]');
      
      // Toggle the checkbox's checked state and trigger the click event
      checkbox.click();
    }
  }
}