// Sidebar Toggle Functionality
// ============================
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");
const toggleSidebar = document.getElementById("toggleSidebar");
let userId;
let productId;

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
        loadProducts();
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
const productsTable = document.getElementById("product-table-body");
const productsContainer = document.querySelector(".products-container");

// Pagination variables
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 1;
let allProducts = [];
let currentProductId = null;

// Pagination elements
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

async function loadProducts() {
  try {
    const data = await apiGet(`/get-products`);
    if (data && data.success && Array.isArray(data.products)) {
      // Store all products and update pagination
      allProducts = data.products;
      totalPages = Math.ceil(allProducts.length / itemsPerPage);
      updatePagination();
      renderProducts();
    } else {
      showAlert("error", data.error || "Failed to load products");
    }
  } catch (error) {
    console.error("Error loading products:", error);
    showAlert("error", "Error loading products");
  }
}

// Create a product row
function createProductRow(product) {
  productId = product.id;
  const statusClass =
    product.status === "available"
      ? "status-available"
      : product.status === "finished"
      ? "status-finished"
      : "status-low";

  const statusText =
    product.status === "available"
      ? "Available"
      : product.status === "finished"
      ? "Finished"
      : "Low";

  return `
    <tr>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.current_stock}</td>
      <td>${product.minimum_stock}</td>
      <td>${parseFloat(product.price).toFixed(2)}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
      <td class="table-actions">
        <button class="btn-shop control-btn" onclick="openModal(${
          product.id
        }, 'Sell ${product.name}', 'Enter the Quantity Sold')">
          <i class="fas fa-cart-plus"></i>
        </button>
        <button class="btn-edit control-btn" onclick="editProduct(${
          product.id
        })">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-delete control-btn confirm-trigger" onclick="openConfirmModal(${
          product.id
        })">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `;
}

// Render products for current page
function renderProducts() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productsToShow = allProducts.slice(startIndex, endIndex);

  if (productsToShow.length === 0) {
    productsTable.innerHTML = `
      <!-- Empty state will be shown when there are no products -->

      <tr>
        <td colspan="8">
          <div class="empty-state">
            <i class="fas fa-box-open"></i>
            <h3>No products found</h3>
            <p>
              Add your first product or try a different search term
            </p>
          </div>
        </td>
      </tr>
    `;
  } else {
    productsTable.innerHTML = productsToShow
      .map((product) => createProductRow(product))
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
    renderProducts();
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

  // Filter products based on search value
  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchValue) ||
      (product.category && product.category.toLowerCase().includes(searchValue))
  );

  // Update products with filtered list
  if (filteredProducts.length === 0) {
    productsTable.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <i class="fas fa-box-open"></i>
            <h3>No products match your search</h3>
            
          </div>
        </td>
      </tr>
    `;
  } else {
    productsTable.innerHTML = filteredProducts
      .map((product) => createProductRow(product))
      .join("");
  }
});

// Function to handle editing a product
function editProduct(productId) {
  window.location.href = `product-form.html?id=${productId}`;
}

//sell the products
async function sellProduct() {
  //get the data from the input fields
  const productId = document.getElementById("Id").value;
  const quantity = document.getElementById("quantity").value;
  const date = document.getElementById("saleDate").value;

  //get the modal
  const modal = document.getElementById("standard-modal-overlay");

  if (!quantity || !date) {
    showAlert("error", "All fields are required");
  } else if (quantity < 0) {
    showAlert("warning", "Quantity cannot be negative");
  } else {
    try {
      const data = await apiPut("/sell-product", {
        productId: productId,
        quantity: quantity,
        saleDate: date,
      });

      if (data && data.success) {
        showAlert("success", "Sale Recorded");
        setTimeout(() => {
          closeModal(modal);
          refreshTable();
        }, 500);
      }
    } catch (error) {
      // console.error("Error selling product:", error);
      showAlert("error", "An error occurred while selling the product.");
    }
  }
}

async function deleteProduct() {
  const modal = document.getElementById("confirmation-modal-overlay");
  const productId = document.getElementById("close-id").value;

  try {
    const data = await apiDelete("/delete-product", {
      productId: productId,
    });

    if (data && data.success) {
      showAlert("success", "Product Deleted");
      setTimeout(() => {
        closeModal(modal);
        refreshTable();
      }, 500);
    }
  } catch {
    showAlert("error", "An error occured while deleting the product.");
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
  loadProducts();
  setTimeout(() => {
    hideLoader();
  }, 500);
}
