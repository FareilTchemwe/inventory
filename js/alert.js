// Toast Alert System
function showAlert(type, message, duration = 2000) {
  const alertBox = document.getElementById("alert");
  const alertMessage = document.getElementById("alertMessage");

  // Clear any existing classes and timeout
  alertBox.className = "alert";
  clearTimeout(alertBox.timeoutId);

  // Set the appropriate type class
  alertBox.classList.add(`alert-${type}`);

  // Set the message
  alertMessage.textContent = message;

  // Remove hidden class and add animation classes
  alertBox.classList.remove("alert-hidden", "alert-exit");
  alertBox.classList.add("alert-enter", "show");

  // Auto-hide after duration
  if (duration) {
    alertBox.timeoutId = setTimeout(() => {
      closeAlert();
    }, duration);
  }
}

function closeAlert() {
  const alertBox = document.getElementById("alert");

  // Add exit animation
  alertBox.classList.remove("alert-enter");
  alertBox.classList.add("alert-exit");

  // Wait for animation to complete before hiding
  setTimeout(() => {
    alertBox.classList.remove("show");
    alertBox.classList.add("alert-hidden");
  }, 500);

  // Clear any existing timeout
  clearTimeout(alertBox.timeoutId);
}

// Event listener for close button
document.getElementById("closeAlert").addEventListener("click", (e) => {
  e.preventDefault();
  closeAlert();
});

// Expose functions globally
window.showAlert = showAlert;
window.closeAlert = closeAlert;
