const productTableBody = document.getElementById("product-table-body");
const welcomeMessage = document.createElement("h2");
welcomeMessage.style.textAlign = "center";
welcomeMessage.style.marginBottom = "20px";
const container = document.querySelector(".container");

async function loadProducts() {
  try {
    const response = await fetch("http://localhost:3000/get-products", {
      method: "GET",
    });

    response.json().then((resp) => {
      if (resp && "products" in resp && "user" in resp) {
        const { products, user } = resp;

        // Display welcome message
        welcomeMessage.textContent = `Welcome, ${user.first_name} ${user.last_name}!`;
        container.prepend(welcomeMessage);

        // Render product table
        productTableBody.innerHTML = products
          .map((product) => createProductRow(product))
          .join("");
      } else if (resp.status == 401) {
        showAlert("error", resp.error);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        showAlert("error", resp.error);
      }
    });
  } catch (error) {
    showAlert("error", "Error loading products");
  }
}

// Load products on page load
loadProducts();

// Create a table row for a product
function createProductRow(product) {
  const statusClass =
    product.status === "available"
      ? "badge-active"
      : product.status === "finished"
      ? "badge-out-of-stock"
      : "badge-warning";

  const statusText =
    product.status === "available"
      ? "Available"
      : product.status === "finished"
      ? "Finished"
      : "Low";

  return `
  <tr>
    <td>${product.id}</td>
    <td>${product.name}</td>
    <td>${product.size}</td>
    <td>${product.color}</td>
    <td style="text-align: center;">${parseFloat(product.price).toFixed(
      2
    )} FCFA</td>
    <td style="text-align: right;">${product.qty}</td>
    <td><span class="badge ${statusClass}">${statusText}</span></td>
    <td>
      <!-- Shop Modal -->
      <button
        class="action-button edit"
        onclick="openModal(${product.id}, ${product.qty})"
      >
        <i class="fa fa-cart-plus"></i>
      </button>

      <!-- Edit Button -->
      <button
        class="action-button edit"
        onclick="editProduct(${product.id})"
      >
        <i class="fas fa-edit"></i>
      </button>

      <!-- Delete Button -->
      <button
        class="action-button delete"
        onclick="deleteProduct(${product.id})"
      >
        <i class="fas fa-trash-alt"></i>
      </button>
    </td>

  </tr>
`;
}

// Function to handle editing a product
function editProduct(productId) {
  // Redirect to the edit page with the product ID
  window.location.href = `edit-product.html?id=${productId}`;
}

// Function to handle deleting a product

// Confirm the deletion action
async function confirmDelete() {
  try {
    const response = await fetch(
      `http://localhost:3000/delete-product/${currentProductId}`,
      {
        method: "DELETE",
      }
    );

    response.json().then((resp) => {
      if (resp && "success" in resp) {
        showAlert("success", "Product deleted successfully.");
        loadProducts(); // Refresh the product list
      } else if (resp.status == 401) {
        showAlert("error", resp.error);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        showAlert("error", resp.error);
      }
      closeConfirmModal();
    });
  } catch (error) {
    showAlert("error", "An error occurred while deleting the product.");
    closeConfirmModal();
  }
}

// Function to handle deleting a product (show custom confirmation modal)
function deleteProduct(productId) {
  currentProductId = productId;
  document.getElementById("confirmModal").classList.add("active");
}
// Close the confirmation modal
function closeConfirmModal() {
  document.getElementById("confirmModal").classList.remove("active");
}

document.getElementById("closeAlert").addEventListener("click", () => {
  const alertBox = document.getElementById("alert");
  alertBox.classList.remove("show");
  setTimeout(() => {
    alertBox.classList.add("alert-hidden");
  }, 500); // Wait for the slide-out animation to complete before hiding
});

// Modal control functions
const modal = document.getElementById("quantityModal");
const productIdInput = document.getElementById("product_id");
const qtyInput = document.getElementById("qty");

function openModal(productId, qty) {
  productIdInput.value = productId;
  qtyInput.max = qty;
  modal.classList.add("active");
}

function closeModal() {
  modal.classList.remove("active");
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
  event.preventDefault(); // Prevent the default form submission

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

    response.json().then((resp) => {
      if (resp && "success" in resp) {
        showAlert("success", "Quantity updated successfully!");
        closeModal(); // Close the modal after success
        loadProducts();
      } else if (resp.status == 401) {
        showAlert("error", resp.error);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        showAlert("error", resp.error);
      }
    });
  } catch (error) {
    showAlert("success", "An error occurred. Please try again.");
  }
});

document.getElementById("searchInput").addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const rows = document.querySelectorAll("#product-table-body tr");

  rows.forEach((row) => {
    const productName = row.cells[1].textContent.toLowerCase(); // Assume 'Name' is the second column
    if (productName.includes(searchValue)) {
      row.style.display = ""; // Show row
    } else {
      row.style.display = "none"; // Hide row
    }
  });
});
