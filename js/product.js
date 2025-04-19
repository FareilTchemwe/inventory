const productsTable = document.getElementById("product-table-body");
const welcomeMessage = document.createElement("h2");
welcomeMessage.style.textAlign = "center";
welcomeMessage.style.marginBottom = "20px";
const productsContainer = document.querySelector(".products-container");

// Pagination variables
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 1;
let allProducts = [];

// Pagination elements
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

async function loadProducts() {
  try {
    const response = await fetch("http://localhost:3000/get-products", {
      method: "GET",
    });

    const resp = await response.json();
    console.log("API Response:", resp); // Debug log

    if (resp && resp.success && Array.isArray(resp.products)) {
      // Store all products and update pagination
      allProducts = resp.products;
      totalPages = Math.ceil(allProducts.length / itemsPerPage);
      updatePagination();
      renderProducts();
    } else if (resp.status === 401) {
      showAlert("error", resp.error);
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      showAlert("error", "Failed to load products");
    }
  } catch (error) {
    console.error("Error loading products:", error);
    showAlert("error", "Error loading products");
  }
}

// Load products on page load
loadProducts();

// Create a product row
function createProductRow(product) {
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
      <td>${product.category || "N/A"}</td>
      <td>${product.size}</td>
      <td>${product.color}</td>
      <td>${parseFloat(product.price).toFixed(2)} FCFA</td>
      <td>${product.qty}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
      <td class="table-actions">
        <button class="btn-edit" onclick="openModal(${product.id}, ${
    product.qty
  })">
          <i class="fas fa-cart-plus"></i>
        </button>
        <button class="btn-edit" onclick="editProduct(${product.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-delete" onclick="deleteProduct(${product.id})">
          <i class="fas fa-trash-alt"></i>
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
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem;">
          No products found
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
  const rows = document.querySelectorAll(".products-table tbody tr");

  rows.forEach((row) => {
    const productName = row
      .querySelector("td:first-child")
      .textContent.toLowerCase();
    if (productName.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

// Function to handle editing a product
function editProduct(productId) {
  window.location.href = `edit-product.html?id=${productId}`;
}

// Function to handle deleting a product
function deleteProduct(productId) {
  currentProductId = productId;
  document.getElementById("confirmModal").style.display = "block";
}

// Confirm the deletion action
async function confirmDelete() {
  try {
    const response = await fetch(
      `http://localhost:3000/delete-product/${currentProductId}`,
      {
        method: "DELETE",
      }
    );

    const resp = await response.json();
    if (resp && resp.success) {
      showAlert("success", "Product deleted successfully.");
      loadProducts(); // Refresh the product list
    } else if (resp.status === 401) {
      showAlert("error", resp.error);
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      showAlert("error", resp.error || "Failed to delete product");
    }
    closeConfirmModal();
  } catch (error) {
    console.error("Error deleting product:", error);
    showAlert("error", "An error occurred while deleting the product.");
    closeConfirmModal();
  }
}

// Close the confirmation modal
function closeConfirmModal() {
  document.getElementById("confirmModal").style.display = "none";
}

// Modal control functions
const modal = document.getElementById("quantityModal");
const productIdInput = document.getElementById("product_id");
const qtyInput = document.getElementById("qty");

function openModal(productId, qty) {
  productIdInput.value = productId;
  qtyInput.max = qty;
  modal.style.display = "block";
}

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
