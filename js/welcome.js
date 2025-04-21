document.addEventListener("DOMContentLoaded", () => {
  // checkAuth()
  //   .then((isAuthenticated) => {
  //     if (isAuthenticated) {
  //       window.location.href = "dashboard.html";
  //     }
  //   })
  //   .catch(() => {});

  // Initialize GSAP animations
  gsap.registerPlugin(ScrollTrigger);

  // Animate welcome image container
  gsap.to(".welcome-image-container", {
    opacity: 1,
    x: 0,
    duration: 0.8,
    ease: "power3.out",
  });

  // Animate welcome content
  gsap.to(".welcome-content", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    delay: 0.2,
    ease: "power3.out",
  });

  // Animate feature items
  gsap.to(".feature-item", {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.1,
    delay: 0.4,
    ease: "power2.out",
  });

  // Animate welcome buttons
  gsap.to(".welcome-buttons", {
    opacity: 1,
    y: 0,
    duration: 0.6,
    delay: 1,
    ease: "power2.out",
  });
});

// ============================
// API Utility Functions
// ============================
const BASE_URL = "http://localhost:3000";

async function apiGet(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
}

function handleResponse(response) {
  if (!response.ok) {
    if (response.status === 401) {
      showAlert("error", "Session expired. Please login again.");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
      throw new Error("Unauthorized");
    }
    throw new Error("Network response was not ok");
  }
  return response.json();
}

// ============================
// Authentication Check
// ============================
async function checkAuth() {
  try {
    const data = await apiGet("/check-auth");
    userId = data.userId;
    return data.authenticated;
  } catch {
    return false;
  }
}
