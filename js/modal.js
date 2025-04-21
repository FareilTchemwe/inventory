// Get DOM elements for standard modal
const modalTrigger = document.querySelector(".modal-trigger");
const standardModalOverlay = document.getElementById("standard-modal-overlay");
const standardModalClose = standardModalOverlay.querySelector(".modal-close");
const standardCancelButton = document.getElementById("standard-cancel-btn");

// Get DOM elements for confirmation modal
const confirmTrigger = document.querySelector(".confirm-trigger");
const confirmationModalOverlay = document.getElementById(
  "confirmation-modal-overlay"
);
const confirmationModalClose =
  confirmationModalOverlay.querySelector(".modal-close");
const confirmationCancelButton = document.getElementById(
  "confirmation-cancel-btn"
);

// Functions to open and close modals
function openModal(id, title, message) {
  // Set the appropriate type class
  document.getElementById("modal-title").textContent = title;
  document.getElementById("main-text").textContent = message;
  document.getElementById("Id").value = id;
  standardModalOverlay.classList.add("active");

  document.body.style.overflow = "hidden";
}

function openConfirmModal(message) {
  document.getElementById("main-text").textContent = message;
  confirmationModalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modalOverlay) {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

standardModalClose.addEventListener("click", () =>
  closeModal(standardModalOverlay)
);
standardCancelButton.addEventListener("click", () =>
  closeModal(standardModalOverlay)
);

confirmationModalClose.addEventListener("click", () =>
  closeModal(confirmationModalOverlay)
);
confirmationCancelButton.addEventListener("click", () =>
  closeModal(confirmationModalOverlay)
);

// Close modals when clicking outside
document.addEventListener("click", function (event) {
  if (event.target === standardModalOverlay) {
    closeModal(standardModalOverlay);
  }
  if (event.target === confirmationModalOverlay) {
    closeModal(confirmationModalOverlay);
  }
});

// Close modals on Escape key press
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    if (standardModalOverlay.classList.contains("active")) {
      closeModal(standardModalOverlay);
    }
    if (confirmationModalOverlay.classList.contains("active")) {
      closeModal(confirmationModalOverlay);
    }
  }
});

// Expose functions globally
window.openModal = openModal;
window.openConfirmModal = openConfirmModal;
window.closeModal = closeModal;
