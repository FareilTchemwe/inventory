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

const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    response.json().then((resp) => {
      console.log(resp);
      if (resp && "success" in resp) {
        showAlert("success", "Logged in successfully! Redirecting...");
        setTimeout(() => (window.location.href = "products.html"), 2000); // Redirect after 2 seconds
      } else {
        showAlert("error", resp.error || "An unknown error occurred");
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    showAlert("error", "An error occurred. Please try again.");
  }
});
