function showAlert(type, message) {
  const alertBox = document.getElementById("alert");
  const alertMessage = document.getElementById("alertMessage");

  // Set the appropriate type class (success or error)
  alertBox.className = `alert alert-${type}`;
  alertMessage.textContent = message;

  // Show the alert with animation
  alertBox.classList.add("show");
  setTimeout(() => {
    alertBox.classList.add("alert-hidden");
  }, 3000);
}

document.getElementById("closeAlert").addEventListener("click", () => {
  const alertBox = document.getElementById("alert");
  alertBox.classList.remove("show");
  setTimeout(() => {
    alertBox.classList.add("alert-hidden");
  }, 500); // Wait for the slide-out animation to complete before hiding
});
