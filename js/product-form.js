let categories;
let userId;

const BASE_URL = "https://inventory-server-five.vercel.app";

// ============================
// Utilities
// ============================

function getProductIdFromURL() {
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
        getCategories();

        const productId = getProductIdFromURL();
        if (productId) {
          populateProductDetails(productId);
          updateFormForEdit();
        }

        initInputAnimations();
      }
    })
    .catch(() => {
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
    "Update Product";
  document.querySelector(".product-form-header p").textContent =
    "Edit the details below to update this product";
  document.querySelector(
    "button[type='submit']"
  ).innerHTML = `<i class="fas fa-save"></i> Update Product`;
}

// ============================
// Form Submission
// ============================

const form = document.getElementById("create-product-form");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const isValid = validateForm();
  if (isValid) {
    const productId = getProductIdFromURL();
    if (productId) {
      updateProduct(productId);
    } else {
      createProduct();
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
    categoryId: document.getElementById("category").value,
    currentStock: parseInt(document.getElementById("qty").value, 10),
    price: parseFloat(document.getElementById("price").value),
    minimumStock: parseInt(document.getElementById("threshold").value, 10),
  };
}

// ============================
// CRUD Operations
// ============================

async function createProduct() {
  try {
    const response = await apiPost("/create-product", getFormData());

    showLoader();
    if (response.success) {
      hideLoader();
      showAlert("success", "Product created successfully!");
      form.reset();
    } else {
      hideLoader();
      showAlert("error", response.message || "Failed to create product.");
    }
  } catch {
    hideLoader();
    showAlert("error", "Server error. Please try again later.");
  }
}

async function updateProduct(productId) {
  try {
    const updatedData = {
      productId: productId,
      ...getFormData(),
    };

    const response = await apiPut(`/update-product/`, updatedData);

    showLoader();
    if (response.success) {
      hideLoader();
      showAlert("success", "Product updated successfully!");
    } else {
      hideLoader();
      showAlert("error", response.message || "Failed to update product.");
    }
  } catch {
    hideLoader();
    showAlert("error", "Server error. Please try again later.");
  }
}

// ============================
// Category & Product Pre-fill
// ============================

async function getCategories() {
  try {
    const data = await apiGet("/get-categories");
    if (data?.success && Array.isArray(data.categories)) {
      if (data.categories == "") {
        showAlert(
          "warning",
          "No categories found. Create a Category before creating a product"
        );
      }

      categories = data.categories;
      populateCategoryDropdown(categories);
    } else {
      showAlert("error", "Failed to load categories.");
    }
  } catch {
    showAlert("error", "Error fetching categories.");
  }
}

function populateCategoryDropdown(categories) {
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = `<option value="">Select Category</option>`;
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

async function populateProductDetails(productId) {
  try {
    const data = await apiGet(`/get-product/${productId}`);
    if (data.success && data.product) {
      const product = data.product[0];
      console.log(product);
      document.getElementById("name").value = product.name || "";
      document.getElementById("category").value = product.category_id || "";
      document.getElementById("price").value = product.price || 0;
      document.getElementById("qty").value = product.current_stock || 0;
      document.getElementById("threshold").value = product.minimum_stock || 0;
    } else {
      showAlert("error", "Failed to load product details.");
    }
  } catch (error) {
    showAlert("error", "Error fetching product.");
  }
}
