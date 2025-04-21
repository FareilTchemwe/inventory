let categories;
let userId;

const BASE_URL = "http://localhost:3000";

// ============================
// Utilities
// ============================

function getCategoryIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

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
        initLoader();
        const categoryId = getCategoryIdFromURL();
        if (categoryId) {
          populateCategoryDetails(categoryId);
          updateFormForEdit();
        }
        initInputAnimations();
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

// ============================
// Input Field Enhancements
// ============================

function initInputAnimations() {
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      const label = input.parentElement.querySelector("label");
      if (label) label.style.color = "#415a77";
    });

    input.addEventListener("blur", () => {
      const label = input.parentElement.querySelector("label");
      if (label) label.style.color = "";
    });
  });
}

function updateFormForEdit() {
  document.querySelector(".product-form-header h1").textContent =
    "Update Category";
  document.querySelector(".product-form-header p").textContent =
    "Edit the details below to update this category";
  document.querySelector(
    "button[type='submit']"
  ).innerHTML = `<i class="fas fa-save"></i> Update Category`;
}

// ============================
// Form Submission
// ============================

const form = document.getElementById("create-product-form");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const isValid = validateForm();
  if (isValid) {
    const categoryId = getCategoryIdFromURL();
    if (categoryId) {
      updateCategory(categoryId);
    } else {
      createCategory();
    }
  }
});

function validateForm() {
  let isValid = true;
  const formGroups = document.querySelectorAll(".form-group");

  formGroups.forEach((group) => {
    const input = group.querySelector("input, select");
    const errorMessage = group.querySelector(".error-message");

    if (errorMessage) group.removeChild(errorMessage);
    group.classList.remove("error");

    if (input.hasAttribute("required") && !input.value.trim()) {
      isValid = false;
      group.classList.add("error");

      const message = document.createElement("span");
      message.className = "error-message";
      message.textContent = `Please enter ${input.placeholder
        .toLowerCase()
        .replace("enter ", "")}`;
      group.appendChild(message);
    }
  });

  return isValid;
}

function getFormData() {
  return {
    name: document.getElementById("name").value.trim(),
  };
}

// ============================
// CRUD Operations
// ============================

async function createCategory() {
  try {
    const response = await apiPost("/create-category", getFormData());

    showLoader();
    if (response.success) {
      hideLoader();
      showAlert("success", "Category created successfully!");
      form.reset();
    } else {
      hideLoader();
      showAlert("error", "Failed to create category.");
    }
  } catch {
    hideLoader();
    showAlert("error", "Server error. Please try again later.");
  }
}

async function updateCategory(categoryId) {
  try {
    const updatedData = {
      categoryId: categoryId,
      ...getFormData(),
    };

    const response = await apiPut(`/update-category/`, updatedData);

    showLoader();
    if (response.success) {
      hideLoader();
      showAlert("success", "Category updated successfully!");
    } else {
      hideLoader();
      showAlert("error", "Failed to update category.");
    }
  } catch {
    hideLoader();
    showAlert("error", "Server error. Please try again later.");
  }
}

async function populateCategoryDetails(categoryId) {
  try {
    const data = await apiGet(`/get-category/${categoryId}`);
    if (data.success && data.category) {
      const category = data.category[0];
      document.getElementById("name").value = category.name || "";
    } else {
      showAlert("error", "Failed to load category details.");
    }
  } catch (error) {
    showAlert("error", "Error fetching category.");
  }
}
