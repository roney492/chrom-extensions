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
        .append("<td>Fetching...</td>")
        .append("<td>Pending...</td>");
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

postToInt.forEach(function (candidate) {
    //make a post request to interview site over here and update the last column of the table.


});


