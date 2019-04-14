/*jshint esversion: 6 */

document.addEventListener("DOMContentLoaded", () => {
  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // Get data about username and current channel id
  const username = localStorage.getItem("username");
  let urlArray = window.location.toString().split('/');
  let channelId = urlArray[urlArray.length - 1];
  // ChannelId might have '?' at the end so make sure it's just the number
  if (channelId.length > 1)
  {
    channelId = channelId[0];
  }

  // When a new user is connected send a message about his joining
  socket.on("connect", function() {
    // If the user hasn't set his username, send him back to the homepage
    if (!localStorage.getItem("username"))
    {
      window.location.replace("/");
    }

    socket.emit("join", {"username": username, "channelId": channelId});
  });

  // This will get called when user sends a message
  document.querySelector("#messageSent").onclick = () => {
    let message = document.querySelector("#userMessage").value;
    // Validate that user has enter a message
    if (message.trim().length < 2)
    {
      // Give the user a warning if message has less than 2 characters and remove the warning after 4 seconds
      document.querySelector("#userMessage").className = "form-control is-invalid";
      setTimeout(() => {
        document.querySelector("#userMessage").className = "form-control";
      }, 4000);
    }
    else
    {
      socket.emit("sendMessage", {"username": username, "channelId": channelId, "message": message});
    }

    // Clear the message box
    document.querySelector("#userMessage").value = "";
  };

  //When user leaves the channel send a message about it
  window.addEventListener("beforeunload", () => {
    socket.emit("leave", {"username": username, "channelId": channelId});
  });

  // This function gets data from handleMessage() function in python and updates the unordered list with it
  socket.on("displayMessage", (data) => {
    // Create boxes (div containers) to hold messages
    let row = document.createElement("div");
    row.className = "row";
    let col = document.createElement("div");
    col.className = "col-8";
    let message = document.createElement("div");

    if (data.isInfoMessage)
    {
      // If it is an info message, just display it
      message.className = "message-info";
      message.innerHTML = `${data.message}`;
    }
    else
    {
      message.className = "message";
      message.innerHTML = `Message by ${data.username} on ${data.date} <br>
        ${data.message}`;
    }

    // Combine the divs together
    col.append(message);
    row.append(col);
    document.querySelector('#messages').append(row);

    // Scroll the window to the bottom
    window.scrollTo(0, document.body.scrollHeight);
  });
});
