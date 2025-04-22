// Password toggle visibility
const passwordToggles = document.querySelectorAll(".password-toggle");
passwordToggles.forEach((toggle) => {
  toggle.addEventListener("click", (e) => {
    const input = e.currentTarget.previousElementSibling;
    if (input.type === "password") {
      input.type = "text";
      e.currentTarget.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    `;
    } else {
      input.type = "password";
      e.currentTarget.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    `;
    }
  });
});

// Navigation items
const navItems = document.querySelectorAll(".nav-item");
navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    navItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
  });
});

const BASE_URL = "http://localhost:3000";

// ============================
// API Wrappers
// ============================

async function apiPost(endpoint, body = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

async function apiPut(endpoint, body = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

async function apiGet(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
}

async function apiDelete(endpoint, body = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

function handleResponse(response) {
  if (!response.ok) {
    if (response.status === 401) {
      showAlert("error", "Session expired. Please login again.");
      setTimeout(() => (window.location.href = "login.html"), 1500);
      throw new Error("Unauthorized");
    }
    throw new Error("Network response was not ok");
  }
  return response.json();
}

// ============================
// Initialization
// ============================

document.addEventListener("DOMContentLoaded", async () => {
  checkAuth()
    .then((isAuthenticated) => {
      if (!isAuthenticated) {
        showAlert("error", "Requires Authentication");
        setTimeout(() => (window.location.href = "login.html"), 500);
      } else {
        loadUserInfo();
      }
    })
    .catch((error) => {
      showAlert("error", "Could not be authenticated. Please try again");
      setTimeout(() => (window.location.href = "login.html"), 500);
    });
});

async function checkAuth() {
  try {
    const data = await apiGet("/check-auth");
    userId = data.userId;
    return data.authenticated;
  } catch {
    return false;
  }
}

// Load user info and remove skeletons
async function loadUserInfo() {
  const username = document.getElementById("username");
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const email = document.getElementById("email");
  const fullName = document.getElementById("fullName");
  const userEmailMain = document.getElementById("user-email");
  const accronym = document.getElementById("accronym");

  apiGet("/get-user")
    .then((data) => {
      if (data && data.success) {
        username.value = data.user.username;
        firstName.value = data.user.first_name;
        lastName.value = data.user.last_name;
        email.value = userEmailMain.innerText = data.user.email;
        fullName.innerText = firstName.value + " " + lastName.value;
        accronym.textContent =
          firstName.value.charAt(0).toUpperCase() +
          lastName.value.charAt(0).toUpperCase();
      } else {
        showAlert("error", "Failed to load user data");
      }
    })
    .catch(() => {
      showAlert("error", "An error occured when loading user data");
    });
}

async function updateProfile() {
  const username = document.getElementById("username").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;

  apiPut("/update-user", {
    username: username,
    firstname: firstName,
    lastname: lastName,
    email: email,
  })
    .then((data) => {
      if (data && data.success) {
        showAlert("success", "Your details have been updated");
        setTimeout(() => {
          loadUserInfo();
        }, 500);
      } else if (data.error) {
        showAlert("error", data.error);
      }
    })
    .catch((error) => {
      showAlert("error", "An error occured when updating user data");
    });
}

async function resetPassword() {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return showAlert("error", "Fill the password fields");
  }
  if (newPassword !== confirmPassword) {
    return showAlert("error", "Password do not match");
  }

  apiPut("/reset-pass", {
    oldPassword: currentPassword,
    newPassword: newPassword,
  })
    .then((data) => {
      if (data && data.success) {
        showAlert("success", "Your Password have been updated");
        setTimeout(() => {
          loadUserInfo();
        }, 500);
      } else if (data.error) {
        showAlert("error", data.error);
      }
    })
    .catch(() => {
      showAlert("error", "An error occured when updating password");
    });
}

async function deleteAccount() {
  apiDelete("/delete-user").then((data) => {
    if (data && data.success) {
      showAlert("success", "Account Deleted");
      setTimeout(() => {
        logout();
      }, 500);
    }
  });
}
