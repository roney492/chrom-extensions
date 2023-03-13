// Listen for messages from the content script
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.dataItem) {
//       // Construct the API URL based on the dataItem object
//       const apiUrl = `https://example.com/api/${message.dataItem.id}`;
  
//       // Get the JWT token from your storage or user input
//       const jwtToken = "your-jwt-token";
  
//       // Construct the headers object with the Authorization header
//       const headers = {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${jwtToken}`
//       };
  
//       // Send an API request using the fetch() method with the headers object
//       fetch(apiUrl, {
//         headers: headers
//       })
//         .then(response => response.json())
//         .then(data => {
//           // Handle the API response here, such as by displaying it in a popup
//           console.log(data);
//         })
//         .catch(error => {
//           // Handle any errors that occur during the API request
//           console.error(error);
//         });
//     }
//   });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendDataItems') {
      console.log(request)
      const dataItems = request.dataItems;
      
      // Process the dataItems as needed
      console.log('Received dataItems:', dataItems);
    }
  });