
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

// Function to check if the user is logged in
async function checkInterviewSiteStatus() {
  try {
    const response = await fetch('https://int-mng.cdmx.io/admin', {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-cache'
    });

    if (response.ok) {
      // The request was successful and returned a status code of 200
      return true;
    } else {
      // The request failed or returned a non-200 status code
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}


const syncButton = document.getElementById('sync-data');
const syncOldDataButton = document.getElementById('sync-old-data');

const spinner = document.getElementById('spinner');
const countElement = document.getElementById('count');
let processedCount = 0;
let totalCount = 0;
// Initialize counters
let rejectedCount = 0;
let hrRoundCount = 0;
let pendingTechCount = 0;
function updateCountDisplay() {
  countElement.textContent = `(${processedCount}/${totalCount})`;
}
syncButton.addEventListener('click', async () => {
  const isLoggedIn = await checkInterviewSiteStatus();

  if (!isLoggedIn) {
    // User is not logged in or offline
    alert('You are not logged into Interview System. Please log in and try again.');
    return;
  }
  try {
    // Show the spinner
    spinner.style.display = 'block';

    // Call the first API to retrieve the initial response
    const response = await fetch('https://int-mng.cdmx.io/api/admin/tests/get_jobsoid_details');
    const data = await response.json();
    totalCount = data.counts[0].count;
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
      if (candidateData.CategorizedAttributes && candidateData.CategorizedAttributes['0']) {
        const attributes = candidateData.CategorizedAttributes['0'];
        for (let i = 0; i < attributes.length; i++) {
          //Update Logic Test score
          if (item.quiz_type_id == 1 && attributes[i].AttributeTypeId === 4840) {
            attributes[i].Value = item.score;
            console.log("logic tests score")
          }
          //Consider non-logic tests as technical and update the technical test score
          if (item.quiz_type_id != 1 && attributes[i].AttributeTypeId === 5290) {
            console.log("non-logic test as technical score"+ item.score)
            attributes[i].Value = item.score;
          }
          //"FieldName": "Tech Test (MCQ)
          if (item.assessment_applicable == "true" && attributes[i].AttributeTypeId === 5290) {
            console.log("Updating technical test score")
            attributes[i].Value = item.assessment_score;
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
        if (item.assessment_applicable == "true") {
          console.log("assessment_applicable true")
          if (item.assessment_score) {
            console.log("assessment_score present")
            console.log("score"+ item.score)
            console.log("passing_score"+ item.passing_score)
            console.log("assessment score"+ item.assessment_score)
            console.log("assessment passing_score"+ item.assessment_passing_score)
            console.log("logic check"+ (item.score < item.passing_score))
            console.log("assessment check"+ (item.assessment_score < item.assessment_passing_score))
          if (item.score < item.passing_score || item.assessment_score < item.assessment_passing_score) {
            console.log("assessment_applicable rejected")
            //For Reject
            pipelineStageId = 71337;
            rejectedCount++;
          } else if(item.score >= item.passing_score && item.assessment_score >= item.assessment_passing_score) {
            console.log("assessment_applicable HR round")
            //86502 for "No Response", 98536 for HR Round
            pipelineStageId = 98536; 
            hrRoundCount++;
          }
        } else {
          //For Pending Technical Test
          pipelineStageId = 309460;
          pendingTechCount++;
        }
      } else if (item.score < item.passing_score) {
          //For Reject
          pipelineStageId = 71337;
          rejectedCount++;
        } else if(item.score >= item.passing_score) {
          //86502 for "No Response", 98536 for HR Round
          pipelineStageId = 98536;
          hrRoundCount++;
        }

        if (pipelineStageId) {

        // Make the additional API call to update the pipeline stage
        await fetch('https://app.jobsoid.com/api/candidates/pipelinestage/update', {
          method: 'PUT',
          body: JSON.stringify({
            Candidates: [
              {
                CandidateId: jobsoidId,
                JobId: parseInt(jobsoidJobId),
                PipelineStageId: pipelineStageId
              }
            ],
            Note: {
              Text: "",
              ShowAdmin: true,
              ShowManager: true,
              ShowUser: true,
              ShowExternal: true
            },
            ReasonId: 0,
            ReasonText: "",
            SendEmail: pipelineStageId === 71337 ? true : false,
            SendSms: false,
            SendQuestionnaire: false,
            SendVideoScreen: false,
            EmailTemplateId: 0,
            SmsTemplateId: 0,
            QuestionnaireId: 0,
            VideoScreenId: 0,
            CustomEmail: {
              Subject: pipelineStageId === 71337 ? "CodeMax || Job Application" : "",
              Body: pipelineStageId === 71337 ? `<div><p>Dear&nbsp;&nbsp;{{FirstName}},</p>\n<p><br></p>\n<p>Thank you so much for your application to {{CompanyName}}.</p>\n<p>Unfortunately, we are not able to pass you on to the next round at this time, as your logic test score did not match our criteria.&nbsp;</p>\n<p>You have our best wishes for success in locating the career opportunity you deserve. We will retain your resume in our files to review for future openings for up to six months. In the event of an appropriate available position, we will not hesitate to contact you.</p>\n<p>We wish you the best of luck in your job search.&nbsp;</p>\n<p><br></p>\n<p><strong>Regards,</strong><br></p>\n<p><strong>Team Human Resources</strong></p>\n<p><strong>
              <img src=\"https://lh3.googleusercontent.com/KnrqWlWoXpp-uxk8y5XAe4zOkzuh3mamsc95tOhwcl-_oFPH7HVehjUeqXOF0-ySluh6838KQP1t4trEcYSJjKPgHbSTTC8nxSVr_rqL3pxNbqsPxQJi7Xals9pQG6pzf236jGjr6HVHogXsSNakeNs\" width=\"251\" height=\"83\" class=\"CToWUd\" data-bit=\"iit\" style=\"--tw-border-spacing-x: 0; --tw-border-spacing-y: 0; --tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgb(59 130 246 / 0.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; cursor: pointer; height: auto; margin-left: 0px; margin-top: 0px;\"></strong></p>\n<p><strong>Email:&nbsp;</strong><a href=\"mailto:%20careers@CdMx.in\" target=\"_blank\">careers@CdMx.in</a></p>\n<p><strong>Address:&nbsp;</strong>Office No A - 201, Asian Pinnacle, Fatorda, Goa - India (403602)</p>\n<p><strong>Mobile:</strong>&nbsp;&nbsp;<a href=\"tel: +91 89561 49326\">+91 89561 49326</a>&nbsp;&nbsp;<strong>Website:</strong><a href=\"http://cdmx.in/\" target=\"_blank\" data-saferedirecturl=\"https://www.google.com/url?q=http://cdmx.in/&amp;source=gmail&amp;ust=1679755038036000&amp;usg=AOvVaw0uzVJjMcATHXF44EovycMS\">&nbsp;</a><a href=\"http://cdmx.in/\" target=\"_blank\" data-saferedirecturl=\"https://www.google.com/url?q=http://CdMx.in&amp;source=gmail&amp;ust=1679755038036000&amp;usg=AOvVaw35V6OGMHbTp4BwxXDkliia\">CdMx.in</a></p>\n<table><tbody><tr><td><p><a href=\"https://www.facebook.com/cdmx.in\" target=\"_blank\" data-saferedirecturl=\"https://www.google.com/url?q=https://www.facebook.com/cdmx.in&amp;source=gmail&amp;ust=1679755038036000&amp;usg=AOvVaw0cMhLqqHSkJL72YieItCFP\">
              <img src=\"https://lh4.googleusercontent.com/o5gJ-t6zkpxVjGvcQYSw_6oRWZEt-jPyrmjkwoed8qf2p-dvJUFesvh-mmekDzORgL8rY9akL30QOh26mChm3WOm9M0HESGRBhjUCls-NqimE41V6Qp9FJCt_kxv-DU9Kf7eipGgN2AfV2xWTvXPdzo\" width=\"16\" height=\"16\" class=\"CToWUd\" data-bit=\"iit\" style=\"--tw-border-spacing-x: 0; --tw-border-spacing-y: 0; --tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgb(59 130 246 / 0.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; cursor: pointer; height: auto; margin-left: 0px; margin-top: 0px;\"></a></p></td><td><p>
              <a href=\"https://www.linkedin.com/company/codemax-pvt-ltd/mycompany/\" target=\"_blank\" data-saferedirecturl=\"https://www.google.com/url?q=https://www.linkedin.com/company/codemax-pvt-ltd/mycompany/&amp;source=gmail&amp;ust=1679755038037000&amp;usg=AOvVaw3josgFbkpqqk-1xY7o1SjB\"><strong><img src=\"https://lh4.googleusercontent.com/RmjM0wmaE3nOMoHL2bnQov4E6uAzYm9Jcv4UB4Ve1ptNF0pHBVhmyef95HSH70jgwWy8OaEzFNXbma-hr4snmZFBJqZDpW_xQuqBKbVKeD2dANLXMBLaKD0CjZqMTi4eOLCVL1uoWId5QLzPgiQX6cw\" width=\"16\" height=\"16\" class=\"CToWUd\" data-bit=\"iit\" style=\"--tw-border-spacing-x: 0; --tw-border-spacing-y: 0; --tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgb(59 130 246 / 0.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; cursor: pointer; height: auto; margin-left: 0px; margin-top: 0px;\"></strong></a></p></td><td><p><a href=\"https://twitter.com/cdmxin\" target=\"_blank\" data-saferedirecturl=\"https://www.google.com/url?q=https://twitter.com/cdmxin&amp;source=gmail&amp;ust=1679755038037000&amp;usg=AOvVaw0YkbrmAGDbdL9lRV-7SmSK\"><strong>
              <img src=\"https://lh4.googleusercontent.com/s4d6PDvXqNUFeme_ql4dblvl85ain5E7Jsan5YrHQsXOpy5vLKyFb6DcOPZefYzxQ-C8AicR8sWkDrLcFMqh2pSMJH_wEPatWZFisXxzBw-dmRkLiWAU00Cy9yTtvXzcwFC5f3H0PcfVksGaOnjICGs\" width=\"16\" height=\"16\" class=\"CToWUd\" data-bit=\"iit\" style=\"--tw-border-spacing-x: 0; --tw-border-spacing-y: 0; --tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgb(59 130 246 / 0.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; cursor: pointer; height: auto; margin-left: 0px; margin-top: 0px;\"></strong></a></p></td></tr></tbody></table>\n<p>This e-mail may contain privileged and confidential information which is the property of CodeMax IT Solutions Pvt. Ltd. It is intended only for the use of the individual or entity to which it is addressed. If you are not the intended recipient, you are not authorized to read, retain, copy, print, distribute, or use this message. If you have received this communication in error, please notify the sender and delete all copies of this message. CodeMax IT Solutions Pvt. Ltd. does not accept any liability for virus-infected e-mail.</p>\n<p><br></p></div>` : ""
            },
            CustomSms: {
              Text: ""
            },
            ScheduledTime: null,
            SendLater: false,
          }),
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
            'Content-Type': 'application/json;charset=UTF-8',
            'Origin': 'https://app.jobsoid.com',
            'Referer': 'https://app.jobsoid.com/App/'
        }
        });

        console.log('Status Successfully Updated for ID:', jobsoidId);
        await fetch(`https://int-mng.cdmx.io/api/admin/tests/update_jobsoid_status?jobsoid_id=${jobsoidId}`);
        processedCount++;
        updateCountDisplay()
      } else {
        console.error('Failed to update status for ID:', jobsoidId);
      }
    } else {
      console.error('Pipeline ID Missing:');
      return
    }

    }
    }

    console.log('Data synchronization completed successfully!');
    spinner.style.display = 'none';
    alert('Data synchronization completed successfully!\nProcessed Count:'+processedCount+'\nRejected Count:'+rejectedCount+'\nHR Round Count:'+hrRoundCount+'\nPending Tech Count:'+pendingTechCount);
  } catch (error) {
    console.error('Error occurred during data synchronization:', error);
    alert('Error occurred during data synchronization:', error);
  } finally {
  }
});

const allPendingSyncCountButton = document.getElementById('sync-pending-count');
const countPendingElement = document.getElementById('count_all');
allPendingSyncCountButton.addEventListener('click', async () => {
  const isLoggedIn = await checkInterviewSiteStatus();

  if (!isLoggedIn) {
    // User is not logged in or offline
    alert('You are not logged into Interview System. Please log in and try again.');
    return;
  }
  try {
    // Show the spinner
    spinner.style.display = 'block';

    // Call the API to retrieve the pending jobsoid_ids
    const response = await fetch('https://int-mng.cdmx.io/api/admin/tests/get_jobsoid_details_all');
    const data = await response.json();
    let pendingCount = data.counts;
    let message = '';
    pendingCount.forEach(item => {
      message += `${item.name}: ${item.count} (${item.hr_name})\n`;
});

alert(message);
  }
  finally {
          // Hide the spinner
          spinner.style.display = 'none';
        }
});
