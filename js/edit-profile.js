// Function to submit the form using JavaScript (AJAX)
function submitForm() {
  // const oldPassword = document.getElementById("oldPassword").value;
  const firstname = document.getElementById("firstname").value;
  const lastname = document.getElementById("lastname").value;
  const username = document.getElementById("username").value;
  // const newPassword = document.getElementById("password").value;

  // Make the PUT request to the /edit-user route
  fetch("http://localhost:3000/edit-user", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // oldPassword,
      firstname,
      lastname,
      username,
      // newPassword, // Send the new password to be updated
    }),
  })
    .then((response) => response.json())
    .then((resp) => {
      if (resp && resp.success) {
        showAlert("success", "Profile updated successfully!");
      } else {
        showAlert("error", resp.error || "An error occurred.");
      }
    })
    .catch((error) => {
      showAlert("error", "An error occurred while updating the profile.");
    });
}

// Fetch current user data (if needed)
document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:3000/get-user")
    .then((response) => response.json())
    .then((data) => {
      if (data.user) {
        document.getElementById("firstname").value = data.user.first_name;
        document.getElementById("lastname").value = data.user.last_name;
        document.getElementById("username").value = data.user.username;
      } else {
        showAlert("error", "Failed to fetch user data.");
      }
    })
    .catch((error) => {
      showAlert("error", "Failed to fetch user data.");
    });
});
