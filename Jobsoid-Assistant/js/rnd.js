
    //Add a delay in this foreach loop as JobSoid might block us.
    console.log("Fetch all the quiz_types from Int-Mng")
    fetch('https://int-mng.cdmx.io/api/admin/quiz_types/get?status=true').then(r => r.text()).then(result => {
        // Result now contains the response text, do what you want...
        result = JSON.parse(result);
        result.query.forEach(function(obj) {
          console.log(obj.name);
        });

      });


      

      fetch('https://int-mng.cdmx.io/api/admin/profiles/get?status=true').then(r => r.text()).then(result => {
        // Result now contains the response text, do what you want...
        result = JSON.parse(result);
        result.query.data.forEach(function(obj) {
          console.log(obj.name);
        });
      });
