// Confirm the deletion action
async function confirmLogout() {
  try {
    const response = await fetch("http://localhost:3000/logout", {
      method: "POST", // POST method to logout
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Any data you might want to send to the server, like session info or token
      }),
    });

    response.json().then((resp) => {
      if (resp && "success" in resp) {
        showAlert("success", "Logged out successfully!");
        closeConfirmModal();
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        showAlert("error", resp.error);
      }
      closeConfirmModal();
    });
  } catch (error) {
    showAlert("error", "An error occurred while logging out.");
    closeConfirmModal();
  }
}

function logout() {
  document.getElementById("confirmModal").classList.add("active");
}
// Close the confirmation modal
function closeConfirmModal() {
  document.getElementById("confirmModal").classList.remove("active");
}

window.addEventListener("click", function (event) {
  if (event.target == document.getElementById("confirmModal")) {
    closeConfirmModal();
  }
});
