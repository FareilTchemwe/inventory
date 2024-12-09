// Function to toggle password visibility
function togglePasswordVisibility(fieldId) {
  const passwordField = document.getElementById(fieldId);
  const toggleIcon = document.getElementById(
    "toggle" + fieldId.charAt(0).toUpperCase() + fieldId.slice(1)
  );

  if (passwordField.type === "password") {
    passwordField.type = "text"; // Show password
    toggleIcon.classList.remove("fa-eye"); // Remove eye icon
    toggleIcon.classList.add("fa-eye-slash"); // Add eye-slash icon
  } else {
    passwordField.type = "password"; // Hide password
    toggleIcon.classList.remove("fa-eye-slash"); // Remove eye-slash icon
    toggleIcon.classList.add("fa-eye"); // Add eye icon
  }
}

// Function to submit the form using JavaScript (AJAX)
function submitForm() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("password").value;

  // Make the PUT request to the /edit-user route
  fetch("http://localhost:3000/reset-pass", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      oldPassword,
      newPassword, // Send the new password to be updated
    }),
  })
    .then((response) => response.json())
    .then((resp) => {
      if (resp && resp.success) {
        showAlert("success", "Password updated successfully!");
      } else if (resp.status == 401) {
        showAlert("error", resp.error);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        showAlert("error", resp.error || "An error occurred.");
      }
    })
    .catch((error) => {
      showAlert("error", "An error occurred while updating the profile.");
    });
}
