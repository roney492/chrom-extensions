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
    tableData += name + "<br>" + email + "<br>" + mobile + "<br><br>";
  });
  
  // Open a new window and write the formatted table data to it
  var newWindow = window.open();
  newWindow.document.write(tableData);
});
