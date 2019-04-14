/*jshint esversion: 6 */

if (!localStorage.getItem("username"))
{
  // If there is no username in the local storage, display the form were user can set it's username
  document.addEventListener('DOMContentLoaded', () => {
    // Make the form to submit username visible
    document.querySelector("#submitUsername").style.visibility = "visible";
    document.querySelector("#submitUsername").onsubmit = () => {
      localStorage.setItem("username", document.querySelector("#username").value);
      displayWelcomeMessage();
    };
  });
}
else
{
  // If the user already has username, hide the form and display welcome message
  document.addEventListener('DOMContentLoaded', () => {
    displayWelcomeMessage();
  });
}

function displayWelcomeMessage()
{
  // Show the findRoom and createRoom links
  document.querySelector("#seeRooms").style.visibility = "visible";
  document.querySelector("#newRoom").style.visibility = "visible";
  // Hide the username submit form
  document.querySelector("#submitUsername").style.visibility = "hidden";

  const username = localStorage.getItem("username");
  document.querySelector("#welcome").innerHTML = `<h2>Hello ${username}!</h2>`;
}
