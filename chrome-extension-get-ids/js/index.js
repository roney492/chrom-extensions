var urlParams = new URLSearchParams(window.location.search);
var dataString = urlParams.get("data");
var data = JSON.parse(decodeURIComponent(dataString));


var candidates = [];

data.forEach(function (element) {
    $("<tr id='" + element + "'></tr>").appendTo("#table tbody")
        .append("<td>" + element + "</td>")
        .append("<td>Fetching...</td>")
        .append("<td>Fetching...</td>")
        .append("<td>Fetching...</td>")
        .append("<td>Fetching...</td>");
});


data.forEach(function (element) {

    //Add a delay in this foreach loop as JobSoid might block us.
    fetch('https://app.jobsoid.com/api/candidates/' + element + '/detail').then(r => r.text()).then(result => {
        // Result now contains the response text, do what you want...
        result = JSON.parse(result);

        var row = $("#" + element);
        $("#" + element + " td:eq(1)").text(result.FullName);
        $("#" + element + " td:eq(2)").text(result.Email);
        $("#" + element + " td:eq(3)").text(result.Phone);
        $("#" + element + " td:eq(4)").text(result.Jobs[0].Name);

        candidates.push({
            id: element,
            email: result.Email,
            phone: result.Phone,
            name: result.FullName
        })

    })
});
$("#export-btn").click(function() {
  // Retrieve the table data and format it as desired
  var tableData = "";
  $("#table tbody tr").each(function() {
    var name = $(this).find("td:eq(1)").text();
    var email = $(this).find("td:eq(2)").text();
    var mobile = $(this).find("td:eq(3)").text();
    tableData += name + "\n" + email + "\n" + mobile + "\n\n";
  });
  

  navigator.clipboard.writeText(tableData);

  alert("Copied! Now directly paste it in the Interview site");
  // Open a new window and write the formatted table data to it
  //var newWindow = window.open();
  //newWindow.document.write(tableData);
});

fetch('https://int-mng.cdmx.io/api/admin/quiz_types/get?status=true').then(r => r.text()).then(result => {
  // Result now contains the response text, do what you want...
  result = JSON.parse(result);
  result.query.forEach(function(obj) {


    var newOption = $("<option>", {
      value: obj.name,
      text: obj.name
    });
    
    // Add the new option to the select element
    $("#select-quiz").append(newOption);
  });
});

fetch('https://int-mng.cdmx.io/api/admin/profiles/get?status=true').then(r => r.text()).then(result => {
  // Result now contains the response text, do what you want...
  result = JSON.parse(result);
  result.query.forEach(function(obj) {


    var newOption = $("<option>", {
      value: obj.name,
      text: obj.name
    });
    
    // Add the new option to the select element
    $("#select-profile").append(newOption);
  });
});
