/*jshint esversion: 6 */

// Redirect to the index page if user hasn't typed his username
if (!localStorage.getItem("username"))
{
  window.location.replace("/");
}

document.addEventListener("DOMContentLoaded", () => {
  // Validate that user has entered a channel name
  document.querySelector("#channelName").onkeyup = () => {
    if (document.querySelector("#channelName").value.trim().length < 4)
    {
      // Display alert
      document.querySelector("#lengthAlert").style.display = "block";
      // Make sure the submit button is disabled
      document.querySelector("#submit").disabled = true;
    }
    else
    {
      // Hide the alert
      document.querySelector("#lengthAlert").style.display = "none";
      // Enable submit button
      document.querySelector("#submit").disabled = false;
    }
  };

  document.querySelector("#createChannel").onsubmit = () => {
    // Validate that channel with selected name doesn't exist
    const request = new XMLHttpRequest();
    const channelName = document.querySelector("#channelName").value;
    request.open("POST", "/validate/" + channelName);
    request.send();

    // Callback function for when request completes
    request.onload = () => {
      const responseValue = request.responseText;
      // If response was true, proceed to create the room
      if (responseValue === "true")
      {
        const redirectRequest = new XMLHttpRequest();
        redirectRequest.open("POST", "/create");
        // Select data to send to the create function on the server
        let data = createFormData(channelName);
        redirectRequest.send(data);

        redirectRequest.onload = () => {
          // Redirect user to the newly created channel
          url = redirectRequest.responseURL;
          window.location.replace(url);
        };
      }
      // If not, display an alert
      else
      {
        document.querySelector("#duplicateAlert").style.display = "block";
        // Close the alert after 5 seconds
        setTimeout(() => {
          document.querySelector("#duplicateAlert").style.display = "none";
        }, 4000);
      }
    };

    return false;
  };
});

function createFormData(channelName)
{
  // Create form data containing channel name and username
  let newData = new FormData();
  newData.append("channelName", channelName);
  newData.append("username", localStorage.getItem("username"));

  return newData;
}
