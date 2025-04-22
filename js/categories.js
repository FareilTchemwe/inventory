// Sidebar Toggle Functionality
// ============================
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");
const toggleSidebar = document.getElementById("toggleSidebar");
let userId;
let categoryId;

toggleSidebar.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded");
});

mobileNavToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded");
});

if (window.innerWidth <= 992) {
  sidebar.classList.add("collapsed");
  mainContent.classList.add("expanded");
}

// ============================
// Main Entry
// ============================
document.addEventListener("DOMContentLoaded", () => {
  checkAuth()
    .then((isAuthenticated) => {
      if (!isAuthenticated) {
        showAlert("error", "Requires Authentication");
        setTimeout(() => (window.location.href = "login.html"), 500);
      } else {
        initLoader();
        loadCategories();
        loadUserInfo();
      }
    })
    .catch(() => {
      showAlert("error", "Could not be authenticated. Please try again");
      setTimeout(() => (window.location.href = "login.html"), 500);
    });
});

// ============================
// API Utility Functions
// ============================
const BASE_URL = "http://localhost:61001";

async function apiGet(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
}

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

// ============================
// Product Management
// ============================
const categoryTable = document.getElementById("product-table-body");
const categoryContainer = document.querySelector(".products-container");

// Pagination variables
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 1;
let allCategories = [];
let currentProductId = null;

// Pagination elements
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

async function loadCategories() {
  try {
    const data = await apiGet(`/getAll-categories`);
    if (data && data.success && Array.isArray(data.categories)) {
      // Store all categories and update pagination
      allCategories = data.categories;
      totalPages = Math.ceil(allCategories.length / itemsPerPage);
      updatePagination();
      renderCategories();
    } else {
      showAlert("error", data.error || "Failed to load categories");
    }
  } catch (error) {
    console.error("Error loading categories:", error);
    showAlert("error", "Error loading categories");
  }
}

// Create a category row
function createCategoryRow(category) {
  categoryId = category.id;

  const statusClass =
    category.status === "active" ? "status-available" : "status-finished";

  const statusText = category.status === "active" ? "Active" : "Inactive";

  const toggleIcon =
    category.status === "active" ? "fas fa-toggle-on" : "fas fa-toggle-off";

  return `
    <tr>
      <td>${category.name}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
      <td class="table-actions">
      <button class="btn-shop control-btn" onclick="updateStatus(${category.id}, '${category.status}')">
          <i class="${toggleIcon}"></i>
        </button>
        <button class="btn-edit control-btn" onclick="editCategory(${category.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-delete control-btn confirm-trigger" onclick="openConfirmModal(${category.id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `;
}

async function updateStatus(categoryId, status) {
  if (status == "active") {
    status = "inactive";
  } else {
    status = "active";
  }

  try {
    const data = await apiPut("/updateCat-status", {
      categoryId: categoryId,
      status: status,
    });

    if (data && data.success) {
      showAlert("success", "Category status updated");
      setTimeout(() => {
        refreshTable();
      }, 500);
    }
  } catch (error) {
    console.error("Error updating categories:", error);
    showAlert("error", "Error updating categories");
  }
}

// Render categories for current page
function renderCategories() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const categoriesToShow = allCategories.slice(startIndex, endIndex);

  if (categoriesToShow.length === 0) {
    categoryTable.innerHTML = `
      <!-- Empty state will be shown when there are no categories -->

      <tr>
        <td colspan="8">
          <div class="empty-state">
            <i class="fas fa-tags"></i>
            <h3>No category found</h3>
            <p>
              Add your first category or try a different search term
            </p>
          </div>
        </td>
      </tr>
    `;
  } else {
    categoryTable.innerHTML = categoriesToShow
      .map((category) => createCategoryRow(category))
      .join("");
  }
}

// Update pagination controls
function updatePagination() {
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

// Event listeners for pagination
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updatePagination();
    renderCategories();
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    updatePagination();
    renderProducts();
  }
});

// Search functionality
document.getElementById("searchInput").addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();

  // Filter categories based on search value
  const filteredCategories = allCategories.filter((category) =>
    category.name.toLowerCase().includes(searchValue)
  );

  // Update products with filtered list
  if (filteredCategories.length === 0) {
    categoryTable.innerHTML = `
     <tr>
        <td colspan="8">
          <div class="empty-state">
            <i class="fas fa-tags"></i>
            <h3>No category match your search</h3>
            
          </div>
        </td>
      </tr>
    `;
  } else {
    categoryTable.innerHTML = filteredCategories
      .map((product) => createCategoryRow(product))
      .join("");
  }
});

// Function to handle editing a product
function editCategory(categoryId) {
  window.location.href = `category-form.html?id=${categoryId}`;
}

async function deleteCategory() {
  const modal = document.getElementById("confirmation-modal-overlay");
  const productId = document.getElementById("close-id").value;

  try {
    const data = await apiDelete("/delete-category", {
      categoryId: productId,
    });

    if (data && data.success) {
      showAlert("success", "Category Deleted");
      setTimeout(() => {
        closeModal(modal);
        refreshTable();
      }, 500);
    }
  } catch {
    showAlert("error", "An error occured while deleting the category.");
  }
}

// Load user info and remove skeletons
async function loadUserInfo() {
  apiGet("/get-user").then((data) => {
    document.getElementById(
      "user-name-skeleton"
    ).outerHTML = `<div class="user-name">${data.user.first_name} ${data.user.last_name}</div>`;
  });
}

function refreshTable() {
  showLoader();
  loadCategories();
  setTimeout(() => {
    hideLoader();
  }, 500);
}
