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
        setupReplenishModal();
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
          <td><button class="action-btn replenish-btn" data-product-id="${
            item.id
          }" data-product-name="${item.name}">Replenish</button></td>
        `;
        tableBody.appendChild(row);
      });

      // Add event listeners for replenish buttons
      document.querySelectorAll(".replenish-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const productId = this.getAttribute("data-product-id");
          const productName = this.getAttribute("data-product-name");
          showReplenishModal(productId, productName);
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching low stock items:", error);
      document.getElementById("lowStockTable").innerHTML = `
        <tr><td colspan="5" class="error-message">Error loading low stock items. Please try again.</td></tr>
      `;
    });
}

// ============================
// Replenish Modal
// ============================
function setupReplenishModal() {
  // Create modal HTML and append to body
  const modalHTML = `
    <div id="replenishModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Replenish Stock</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <p>Enter quantity to replenish for <span id="productName"></span>:</p>
          <div class="input-group">
            <label for="replenishQuantity">Quantity</label>
            <input type="number" id="replenishQuantity" min="1" value="1" class="form-control">
          </div>
        </div>
        <div class="modal-footer">
          <button id="cancelReplenish" class="btn btn-secondary">Cancel</button>
          <button id="confirmReplenish" class="btn btn-primary">Confirm</button>
        </div>
      </div>
    </div>
  `;

  // Add modal CSS
  const modalStyle = document.createElement("style");
  modalStyle.textContent = `
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      align-items: center;
      justify-content: center;
    }
    
    .modal.active {
      display: flex;
      animation: fadeIn 0.3s;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .modal-content {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 500px;
      position: relative;
      overflow: hidden;
      transform: scale(0.9);
      transition: transform 0.3s;
    }
    
    .modal.active .modal-content {
      transform: scale(1);
    }
    
    .modal-header {
      background: #f8f9fa;
      padding: 15px 20px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #212529;
    }
    
    .close-modal {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
      transition: color 0.2s;
    }
    
    .close-modal:hover {
      color: #212529;
    }
    
    .modal-body {
      padding: 20px;
    }
    
    #productName {
      font-weight: bold;
    }
    
    .input-group {
      margin-top: 15px;
    }
    
    .input-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.15s ease-in-out;
    }
    
    .form-control:focus {
      border-color: #80bdff;
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .modal-footer {
      padding: 15px 20px;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    
    .btn {
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background-color: #415a77;
      color: white;
      border: none;
    }
    
    .btn-primary:hover {
      background-color: #344760;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      border: none;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #5a6268;
    }
    
    /* Responsive adjustments */
    @media (max-width: 576px) {
      .modal-content {
        width: 95%;
      }
      
      .modal-footer {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
        margin-bottom: 5px;
      }
    }
  `;

  document.head.appendChild(modalStyle);
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Set up event listeners for modal
  document
    .querySelector(".close-modal")
    .addEventListener("click", closeReplenishModal);
  document
    .getElementById("cancelReplenish")
    .addEventListener("click", closeReplenishModal);
}

function showReplenishModal(productId, productName) {
  const modal = document.getElementById("replenishModal");
  document.getElementById("productName").textContent = productName;
  document.getElementById("replenishQuantity").value = "1";

  // Show modal
  modal.classList.add("active");

  // Focus on quantity input
  document.getElementById("replenishQuantity").focus();

  // Set up confirm button
  const confirmButton = document.getElementById("confirmReplenish");
  // Remove previous event listeners
  const newConfirmButton = confirmButton.cloneNode(true);
  confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

  // Add new event listener
  newConfirmButton.addEventListener("click", function () {
    const quantity = parseInt(
      document.getElementById("replenishQuantity").value
    );

    replenishProduct(productId, quantity);
    closeReplenishModal();
  });
}

function closeReplenishModal() {
  const modal = document.getElementById("replenishModal");
  modal.classList.remove("active");
}

function replenishProduct(productId, quantity) {
  apiPost(`/replenish`, {
    productId: productId,
    quantity: quantity,
  })
    .then(() => {
      showAlert("success", "Replenish request submitted successfully");
      refreshDashboard();
    })
    .catch((error) => {
      console.error("Error submitting replenish request:", error);
      showAlert("error", "Error submitting replenish request");
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

// Load user info and remove skeletons
async function loadUserInfo() {
  apiGet("/user").then((data) => {
    document.getElementById(
      "user-name-skeleton"
    ).outerHTML = `<div class="user-name">${data.user[0].first_name} ${data.user[0].last_name}</div>`;
  });
}
