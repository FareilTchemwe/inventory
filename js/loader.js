// Create and append loader HTML to the body
function createLoader() {
  const loaderHTML = `
    <div id="loaderContainer" class="loader-container">
      <div class="loader"></div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", loaderHTML);
}

// Show loader function
function showLoader() {
  const loader = document.getElementById("loaderContainer");
  loader.classList.add("show");
}

// Hide loader function
function hideLoader() {
  const loader = document.getElementById("loaderContainer");
  loader.classList.remove("show");
}

// Initialize loader
function initLoader() {
  createLoader();
}

// Expose functions globally
window.showLoader = showLoader;
window.hideLoader = window.hideLoader;
