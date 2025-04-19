// ============================
// Sidebar Toggle Functionality
// ============================
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");
const toggleSidebar = document.getElementById("toggleSidebar");

toggleSidebar.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded");
});

mobileNavToggle.addEventListener("click", () => {
  console.log("click");
  sidebar.classList.toggle("open");
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded");
});

if (window.innerWidth <= 992) {
  sidebar.classList.add("collapsed");
  mainContent.classList.add("expanded");
}

// ============================
// Global Chart Instances
// ============================
let stockChart = null;
let salesChart = null;

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
        initializeDashboard();
        setupCharts();
        loadLowStockItems();
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

function handleResponse(response) {
  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "login.html";
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
    return data.authenticated;
  } catch {
    return false;
  }
}

// ============================
// Dashboard Logic
// ============================
function initializeDashboard() {
  apiGet("/api/dashboard/stats")
    .then(updateStatistics)
    .catch((error) => {
      console.error("Error fetching dashboard statistics:", error);
      showAlert("Error loading dashboard data", "error");
    });
}

function updateStatistics(data) {
  const statsGrid = document.getElementById("stats-grid");
  statsGrid.innerHTML = `
    <div class="stat-card animate-fadeIn">
      <h3>Total Products</h3>
      <div class="value" id="totalProducts">${data.totalProducts}</div>
      <div class="label">All available products</div>
      <div class="background-icon">
          <i class="fas fa-box"></i>
      </div>
    </div>
    <div class="stat-card animate-fadeIn">
      <h3>Low Stock Items</h3>
      <div class="value" id="lowStockItems">${data.lowStockItems}</div>
      <div class="trend warning">
        <i class="fas fa-exclamation-circle"></i> Needs attention
      </div>
      <div class="background-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
    </div>
    <div class="stat-card animate-fadeIn">
      <h3>Total Value</h3>
      <div class="value" id="totalValue">${data.totalValue}</div>
      <div class="trend positive">Products Value</div>
      <div class="background-icon">
        <i class="fas fa-dollar-sign"></i>
      </div>
    </div>
    <div class="stat-card animate-fadeIn">
      <h3>Categories</h3>
      <div class="value" id="totalCategories">${data.totalCategories}</div>
      <div class="label">Product categories</div>
      <div class="background-icon">
        <i class="fas fa-tags"></i>
      </div>
    </div>`;
}

// ============================
// Charts
// ============================
function setupCharts() {
  apiGet("/api/dashboard/stock-by-category")
    .then((data) => {
      createStockChart(data.categories, data.stockLevels);
    })
    .catch((error) => {
      console.error("Error fetching category stock data:", error);
      createStockChart(
        ["Electronics", "Clothing", "Food", "Books", "Other"],
        [120, 190, 80, 50, 30]
      );
    });

  apiGet("/api/dashboard/sales-trend")
    .then((data) => {
      createSalesChart(data.months, data.salesData);
    })
    .catch((error) => {
      console.error("Error fetching sales trend data:", error);
      createSalesChart(
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        [65, 59, 80, 81, 56, 55]
      );
    });
}

function createStockChart(labels, data) {
  if (stockChart) stockChart.destroy();

  document.getElementById("stockChartSkeleton").style.display = "none";
  const ctx = document.getElementById("stockChart").getContext("2d");
  document.getElementById("stockChart").style.display = "block";
  stockChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Stock Levels",
          data,
          backgroundColor: [...generateColorArray(data.length, 0.8)],
          borderColor: [...generateColorArray(data.length, 1)],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

function createSalesChart(labels, data) {
  if (salesChart) salesChart.destroy();

  document.getElementById("salesChartSkeleton").style.display = "none";
  const ctx = document.getElementById("salesChart").getContext("2d");
  document.getElementById("salesChart").style.display = "block";

  salesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Sales",
          data,
          fill: false,
          borderColor: "rgba(65, 90, 119, 1)",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

function generateColorArray(count, alpha) {
  const colors = [
    "rgba(65, 90, 119,",
    "rgba(119, 141, 169,",
    "rgba(224, 225, 221,",
    "rgba(13, 27, 42,",
    "rgba(27, 38, 59,",
  ];
  return Array.from(
    { length: count },
    (_, i) => `${colors[i % colors.length]} ${alpha})`
  );
}

// ============================
// Low Stock Items
// ============================
function loadLowStockItems() {
  apiGet("/api/dashboard/low-stock")
    .then((data) => {
      const tableBody = document.getElementById("lowStockTable");
      tableBody.innerHTML = "";

      if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="no-data">No low stock items found.</td></tr>`;
        return;
      }

      data.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.currentStock}</td>
          <td>${item.minimumRequired}</td>
          <td><span class="status-badge ${getStatusClass(
            item
          )}">${getStatusText(item)}</span></td>
          <td><button class="action-btn" onclick="openModal('${
            item.id
          }')">Reorder</button></td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error fetching low stock items:", error);
      document.getElementById("lowStockTable").innerHTML = `
        <tr><td colspan="5" class="error-message">Error loading low stock items. Please try again.</td></tr>
      `;
    });
}

function reorderProduct(productId) {
  apiPost(`/api/products/${productId}/reorder`)
    .then(() => {
      showAlert("Reorder request submitted successfully", "success");
      loadLowStockItems();
    })
    .catch((error) => {
      console.error("Error submitting reorder request:", error);
      showAlert("Error submitting reorder request", "error");
    });
}

// ============================
// Stock Status Helpers
// ============================
function getStatusClass(item) {
  const ratio = item.currentStock / item.minimumRequired;
  if (ratio <= 0.2) return "status-critical";
  return "status-warning";
}

function getStatusText(item) {
  const ratio = item.currentStock / item.minimumRequired;
  if (ratio <= 0.2) return "Critical";
  return "Warning";
}

// ============================
// Refresh Button Handler
// ============================
function refreshDashboard() {
  initializeDashboard();
  setupCharts();
  loadLowStockItems();
  showAlert("success", "Dashboard refreshed successfully");
}
// Modal control functions
const modal = document.getElementById("quantityModal");
const productIdInput = document.getElementById("product_id");
const qtyInput = document.getElementById("qty");

function closeModal() {
  modal.style.display = "none";
}

window.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  } else if (event.target == document.getElementById("confirmModal")) {
    closeConfirmModal();
  }
});
// Handle form submission using JavaScript to make a POST request to /shop
const shopForm = document.getElementById("shop-form");

shopForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const productId = productIdInput.value;
  const quantity = shopForm.querySelector('input[name="quantity"]').value;

  try {
    const response = await fetch("http://localhost:3000/shop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    });

    const resp = await response.json();
    if (resp && resp.success) {
      showAlert("success", "Quantity updated successfully!");
      closeModal();
      loadProducts();
    } else if (resp.status === 401) {
      showAlert("error", resp.error);
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      showAlert("error", resp.error || "Failed to update quantity");
    }
  } catch (error) {
    console.error("Error updating quantity:", error);
    showAlert("error", "An error occurred. Please try again.");
  }
});

function openModal(productId, qty) {
  productIdInput.value = productId;
  qtyInput.max = qty;
  modal.style.display = "block";
}
