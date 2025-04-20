// Get DOM elements
const modalTrigger = document.querySelector(".modal-trigger");
const modalOverlay = document.querySelector(".modal-overlay");
const modalClose = document.querySelector(".modal-close");
const cancelButton = document.querySelector(".btn-secondary");

// Functions to open and close modal
function openModal() {
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Event listeners
modalTrigger.addEventListener("click", openModal);
modalClose.addEventListener("click", closeModal);
cancelButton.addEventListener("click", closeModal);

// Close modal when clicking outside
modalOverlay.addEventListener("click", function (event) {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

// Close modal on Escape key press
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && modalOverlay.classList.contains("active")) {
    closeModal();
  }
});
