// Call this function when the document is loaded
document.addEventListener("DOMContentLoaded", initLoader);

function togglePasswordVisibility(passwordId, toggleIconId) {
  const passwordField = document.getElementById(passwordId);
  const toggleIcon = document.getElementById(toggleIconId);

  if (passwordField.type === "password") {
    passwordField.type = "text"; // Show password
    toggleIcon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    passwordField.type = "password"; // Hide password
    toggleIcon.classList.replace("fa-eye-slash", "fa-eye");
  }
}

const signUpForm = document.getElementById("signUpForm");
signUpForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirmPassword").value.trim();
  const username = document.getElementById("username").value.trim();

  // Check if passwords match
  if (password !== confirm) {
    showAlert("error", "Passwords do not match. Please try again.");
    return; // Stop execution and don't make the API call
  }

  // Show loader before API call
  showLoader();
  try {
    const response = await fetch("http://localhost:61001/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        username,
        password,
      }),
    });

    response.json().then((resp) => {
      if (resp && "success" in resp) {
        setAuthData(resp.token, resp.expiresIn);
        showAlert("succes", "Account Created Successfully. Redirecting");
        setTimeout(() => {
          // Redirect to dashboard
          window.location.href = "dashboard.html";
        }, 500);
      } else {
        hideLoader();
        showAlert("error", resp.error || "An unknown error occurred");
      }
    });
  } catch (error) {
    hideLoader();
    console.error("Error during Sign Up:", error);
    showAlert("error", "An error occurred. Please try again.");
  }
});
