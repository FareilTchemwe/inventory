// Function to toggle password visibility
function togglePasswordVisibility() {
  const passwordField = document.getElementById("password");
  const toggleIcon = document.getElementById("togglePassword");

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

// Handle form submission with AJAX (JavaScript)
document
  .getElementById("registerForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // Gather form data
    const firstName = document.getElementById("firstname").value;
    const lastName = document.getElementById("lastname").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Validate form data
    if (!firstName || !lastName || !username || !password) {
      showAlert("error", "All fields are required!");
      return;
    }

    // Send a POST request using fetch to the /register route
    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, username, password }),
      });

      response.json().then((resp) => {
        if (resp && "success" in resp) {
          showAlert("success", "User registered successfully!");
        } else {
          showAlert("error", resp.error);
        }
      });
    } catch (error) {
      showAlert("error", "An error occurred. Please try again.");
    }
  });
