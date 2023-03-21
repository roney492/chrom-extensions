var urlParams = new URLSearchParams(window.location.search);
var dataString = urlParams.get("data");
var data = JSON.parse(decodeURIComponent(dataString));

var candidates = [];

data.forEach(function (element) {
  $("<tr id='" + element + "'></tr>").appendTo("#table tbody")
    .append("<td><a href='https://app.jobsoid.com/App/#/Candidates/" + element + "/' target='_blank'>" + element + "<a/></td>")
    .append("<td>Fetching...</td>")
    .append("<td>Fetching...</td>")
    .append("<td>Fetching...</td>")
    .append("<td>Fetching...</td>")
    .append("<td>Fetching...</td>")
    .append("<td>Fetching...</td>");
});

// Create an array to store all the promises
let promises = [];

// Loop through the data array and create a promise for each element
data.map((element, index) => {
  let promise = new Promise((resolve) => {
    setTimeout(() => {
      fetch('https://app.jobsoid.com/api/candidates/' + element + '/detail')
        .then(r => r.text())
        .then(result => {
          result = JSON.parse(result);
          // Split the name into first and last name
          const nameParts = result.FullName.split(' ');
          const last_name = nameParts.pop();
          const first_name = nameParts.join(' ');
          const phone = result.Phone.replace(/[^\d+]/g, '');

          $("#" + element + " td:eq(1)").text(first_name + ' ' + last_name);
          $("#" + element + " td:eq(2)").text("Ready");
          $("#" + element + " td:eq(3)").text("Waiting");
          $("#" + element + " td:eq(4)").text(result.Email);
          $("#" + element + " td:eq(5)").text(phone);
          $("#" + element + " td:eq(6)").text("Waiting");

          candidates.push({
            email: result.Email,
            mobile: phone,
            first_name: first_name,
            last_name: last_name
          });

          resolve();
        });
    }, index * 500);
  });

  // Add the promise to the promises array
  promises.push(promise);
});

// Wait for all the promises to complete using Promise.all()
Promise.all(promises).then(() => {
  $("#generate-tests").html('Generate and Send tests').prop('disabled', false);
  $("#export-btn").prop('disabled', false);
});



$("#export-btn").click(function () {
  var tableData = "";
  $("#table tbody tr").each(function () {
    var name = $(this).find("td:eq(1)").text();
    var email = $(this).find("td:eq(4)").text();
    var mobile = $(this).find("td:eq(5)").text();
    tableData += name + "\n" + email + "\n" + mobile + "\n\n";
  });

  navigator.clipboard.writeText(tableData);

  alert("Copied! Now directly paste it in the Interview site");
});

const testIds = [];
const button = document.getElementById("generate-tests");
button.addEventListener("click", () => {
  button.disabled = true;
  const selectProfileValue = document.getElementById("select-profile").value;
  const selectTechQuizValue = document.getElementById("select-quiz-tech").value;

  if (selectProfileValue == "Select a profile" || selectTechQuizValue == null) {
    alert("Please select a quiz type, profile, and quiz tech before generating tests.");
    return;
  }

  const postData = {
    profile_code: selectProfileValue,
    quiz_type_id: "1", //We only generate Logic Test from Jobsoid.
    tech_quiz_type_id: selectTechQuizValue,
    type: 'CANDIDATE',
    user_details: candidates
  };

  if ($('#InterviewSiteStatus').text() == 'OFFLINE') {
    alert("You are not logged in to the interview site. Kindly login first and try again");
    return;
  }
  fetch('https://int-mng.cdmx.io/api/admin/tests/mass_generate_ext', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  })
    .then(response => response.json())
    .then(data => {
      const repeatData = data.repeat;
      const tableBody = document.querySelector("#table tbody");
      const rows = tableBody.getElementsByTagName("tr");
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const email = row.cells[4].textContent.trim();
        console.log(email)
        const repeatObj = repeatData.find(obj => obj.email === email);
        if (repeatObj) {
          row.cells[2].textContent = "Received";
          row.cells[3].textContent = repeatObj.code;
          row.cells[6].textContent = repeatObj.insert_test.identity;
          testIds.push(repeatObj.insert_test.identity);
        }
      }
      alert("Successfully generated Tests, Please wait 10s for the Statistics");
    })
    .catch(error => {
      alert("Something went wrong");
    });
  setTimeout(() => {
    fetch('https://int-mng.cdmx.io/api/admin/tests/get?status=WAITING&limit=0')
      .then(response => response.json())
      .then(data => {
        let total = 0;
        let generated = 0;
        let failed = 0;
        Array.from(document.querySelectorAll('tbody tr')).forEach(row => {
          const testCode = row.cells[3].textContent;
          const test = data.query.data.find(test => test.code === testCode);
          if (test) {
            row.cells[2].textContent = "Generated";
            row.cells[2].classList.add("text-green");
            generated++;
          } else {
            row.cells[2].textContent = "Failed";
            row.cells[2].classList.add("text-red");
            failed++;
          }
          total++;
        });
        // Update the statistics
        document.getElementById("total").textContent = total;
        document.getElementById("generated").textContent = generated;
        document.getElementById("failed").textContent = failed;
        fetch('https://int-mng.cdmx.io/api/admin/tests/send_checked', {
        method: 'POST',
        body: JSON.stringify({
          sub: "CodeMax || Logic Test",
          id: testIds
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log(data);
          // Close the modal
          $('#sendModal').modal('hide');
        })
        .catch(error => {
          console.error('There was a problem while sending:', error);
        });
      // Sending WhatsApp Notifications
      fetch('https://int-mng.cdmx.io/api/admin/tests/send_checked_wa', {
        method: 'POST',
        body: JSON.stringify({
          id: testIds
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) {
            alert("Network error while sending WhatsApp Notifications");
            throw new Error('Network error while sending WhatsApp Notifications');
          }
          return response.json();
        })
        .then(data => {
          // Close the modal
          $('#sendModal').modal('hide');
          alert("Tests Successfully sent out.");
        })
        .catch(error => {
          alert('There was a problem while sending WhatsApp Notifications:', error);
          console.error('There was a problem while sending WhatsApp Notifications:', error);
        });
      })
      .catch(error => {
        alert(error);
      });
  }, 10000);
});

// // Get the Send button element
// const sendBtn = document.getElementById('sendTestBtn');

// const openModalBtn = document.getElementById('openModalBtn');
// // Add a click event listener to the button
// openModalBtn.addEventListener('click', () => {
//   // Show the modal
//   $('#sendModal').modal('show');
// });

// sendBtn.addEventListener('click', () => {
// });

const refreshButton = document.querySelector('#refresh');
refreshButton.addEventListener('click', refreshTable);

function refreshTable() {
  if (document.getElementById("select-profile").value == "Select a profile") {
    alert("Select Profile first");
    return false;
  }
  fetch('https://int-mng.cdmx.io/api/admin/tests/get?status=WAITING&limit=0')
    .then(response => response.json())
    .then(data => {
      let total = 0;
      let generated = 0;
      let failed = 0;
      Array.from(document.querySelectorAll('tbody tr')).forEach(row => {
        const testCode = row.cells[3].textContent;
        const test = data.query.data.find(test => test.code === testCode);
        if (test) {
          row.cells[2].textContent = "Generated";
          row.cells[2].classList.add("text-green");
          generated++;
        } else {
          row.cells[2].textContent = "Failed";
          row.cells[2].classList.add("text-red");
          failed++;
        }
        total++;
      });
      // Update the statistics
      document.getElementById("total").textContent = total;
      document.getElementById("generated").textContent = generated;
      document.getElementById("failed").textContent = failed;
      // Get the subject from the text field
      // const subject = document.getElementById('sub').value;

      // Send the POST request to send mails
    })
    .catch(error => {
      alert(error);
    });
    
}

$(document).ready(function () {

  fetch('https://int-mng.cdmx.io/api/admin/quiz_types/get?status=true', {
    redirect: 'manual'
  })
    .then(r => {
      if (r.status === 302) {
        setTimeout(() => {
          alert('Are you logged in?');
        }, 0);
        throw new Error('Redirected');
      }
      return r.text();
    })
    .then(result => {
      result = JSON.parse(result);
      result.query.forEach(function (obj) {
        //We only select logic for Quiz Type, so value is hardcoded to 1
        // add options to select-quiz-tech dropdown
        var newOptionTech = $("<option>", {
          value: obj.id,
          text: obj.name
        });
        $("#select-quiz-tech").append(newOptionTech);
      });

      // add "NA" option to select-quiz-tech dropdown
      var newOptionNA = $("<option>", {
        value: "",
        text: "NA",
        selected: true
      });
      $("#select-quiz-tech").prepend(newOptionNA);
    });


  fetch('https://int-mng.cdmx.io/api/admin/profiles/get?status=true').then(r => r.text()).then(result => {
    result = JSON.parse(result);
    result.query.forEach(function (obj) {
      var newOption = $("<option>", {
        value: obj.code,
        text: obj.name
      });
      $("#select-profile").append(newOption);
    });
  });

  // Call the function every 5 minutes using setInterval()
  checkInterviewSiteStatus();
  setInterval(checkInterviewSiteStatus, 2 * 60 * 1000); // 5 minutes in milliseconds
});


function checkInterviewSiteStatus() {
  fetch('https://int-mng.cdmx.io/admin', {
    method: 'GET',
    redirect: 'manual', // prevent the browser from following redirects
    cache: 'no-cache' // disable caching to ensure a fresh response is received
  })
    .then(response => {
      if (response.ok) {
        // The request was successful and returned a status code of 200
        $('#InterviewSiteStatus')
          .removeClass('bg-warning bg-danger')
          .addClass('bg-success')
          .text('ONLINE');
      } else {
        // The request failed or returned a non-200 status code
        $('#InterviewSiteStatus')
          .removeClass('bg-warning bg-success')
          .addClass('bg-danger')
          .text('OFFLINE');
      }
    })
    .catch(error => {
      console.error(error);
    });
}

