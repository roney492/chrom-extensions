
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
const syncButton = document.getElementById('sync-data');

syncButton.addEventListener('click', async () => {
  try {
    // Show the spinner
    spinner.style.display = 'block';

    // Call the first API to retrieve the initial response
    const response = await fetch('https://int-mng.cdmx.io/api/admin/tests/get_jobsoid_details');
    const data = await response.json();

    // Process each item in the response
    for (const item of data.query) {
      // Check if jobsoid_id and jobsoid_jobid exist
      if (item.jobsoid_id && item.jobsoid_jobid) {
      // Get the jobsoid_id and jobsoid_jobid for the current item
      const jobsoidId = item.jobsoid_id;
      const jobsoidJobId = item.jobsoid_jobid;

      // Call the second API to retrieve the candidate data
      const candidateResponse = await fetch(`https://app.jobsoid.com/api/candidates/${jobsoidId}/edit`);
      const candidateData = await candidateResponse.json();

      // Update the value of "Value" with the score where "AttributeTypeId" is 4840
      if (
        candidateData.CategorizedAttributes &&
        candidateData.CategorizedAttributes['0']
      ) {
        const attributes = candidateData.CategorizedAttributes['0'];
        for (let i = 0; i < attributes.length; i++) {
          if (attributes[i].AttributeTypeId === 4840) {
            attributes[i].Value = item.score;
            break;
          }
        }
      }

      // Send the updated response to the third API using PUT method
      const updateScore = await fetch('https://app.jobsoid.com/api/candidates', {
        method: 'PUT',
        body: JSON.stringify(candidateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (updateScore.ok) {
        const putData = await updateScore.json();
        console.log('Score successfully Updated for ID:', jobsoidId);

        // Determine the PipelineStageId based on the score and passing_score
        let pipelineStageId;
        if (item.score < item.passing_score) {
          //For Reject
          pipelineStageId = 71337;
        } else {
          //For HR Round
          pipelineStageId = 98536;
        }

        // Make the additional API call to update the pipeline stage
        await fetch('https://app.jobsoid.com/api/candidates/pipelinestage/update', {
          method: 'PUT',
          body: JSON.stringify({
            Candidates: [
              {
                CandidateId: jobsoidId,
                JobId: jobsoidJobId,
                PipelineStageId: pipelineStageId
              }
            ],
            Note: {
              NoteId: 0,
              ReviewId: 0,
              DocumentId: 0,
              ContactId: 0,
              ShowAdmin: true,
              ShowManager: true,
              ShowUser: true,
              ShowExternal: true,
              ShowPublic: true
            },
            ReasonId: 0,
            ReasonText: "",
            SendEmail: false,
            SendSms: false,
            SendQuestionnaire: false,
            SendVideoScreen: false,
            EmailTemplateId: 0,
            SmsTemplateId: 0,
            QuestionnaireId: 0,
            VideoScreenId: 0,
            CustomEmail: {
              Subject: "",
              Body: ""
            },
            CustomSms: {
              Text: ""
            },
            ScheduledTime: null,
            SendLater: false
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Status Successfully Updated for ID:', jobsoidId);
        await fetch(`https://int-mng.cdmx.io/api/admin/tests/update_jobsoid_status?jobsoid_id=${jobsoidId}`);
      } else {
        console.error('Failed to update status for ID:', jobsoidId);
      }
    }
    }

    console.log('Data synchronization completed successfully!');
    alert('Data synchronization completed successfully!');
  } catch (error) {
    console.error('Error occurred during data synchronization:', error);
    alert('Error occurred during data synchronization:', error);
  } finally {
    // Hide the spinner
    spinner.style.display = 'none';
  }
});