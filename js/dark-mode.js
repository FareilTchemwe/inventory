// Theme toggle functionality
const themeToggle = document.getElementById("theme-toggle");
const themeText = document.getElementById("theme-text");
const lightIcon = document.getElementById("light-icon");
const darkIcon = document.getElementById("dark-icon");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");

  if (isDarkMode) {
    themeText.textContent = "Light Mode";
    lightIcon.style.display = "none";
    darkIcon.style.display = "block";
  } else {
    themeText.textContent = "Dark Mode";
    lightIcon.style.display = "block";
    darkIcon.style.display = "none";
  }
});
