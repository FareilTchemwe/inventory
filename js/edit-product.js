document.addEventListener("DOMContentLoaded", async function () {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    showAlert("error", "No product ID provided");
    setTimeout(() => {
      window.location.href = "products.html";
    }, 1500);
    return;
  }

  // Load product data
  try {
    const response = await fetch(
      `http://localhost:3000/get-product/${productId}`
    );
    const data = await response.json();

    if (data.success && data.product) {
      const product = data.product;
      // Populate form fields
      document.getElementById("name").value = product.name;
      document.getElementById("category").value = product.category || "";
      document.getElementById("size").value = product.size;
      document.getElementById("color").value = product.color;
      document.getElementById("price").value = product.price;
      document.getElementById("qty").value = product.qty;
      document.getElementById("threshold").value = product.threshold;
      document.getElementById("status").value = product.status;
    } else if (data.status === 401) {
      showAlert("error", data.error);
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      showAlert("error", "Failed to load product data");
      setTimeout(() => {
        window.location.href = "products.html";
      }, 1500);
    }
  } catch (error) {
    console.error("Error loading product:", error);
    showAlert("error", "Error loading product data");
    setTimeout(() => {
      window.location.href = "products.html";
    }, 1500);
  }

  // Handle form submission
  const form = document.getElementById("edit-product-form");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get form data
    const formData = {
      name: document.getElementById("name").value,
      category: document.getElementById("category").value,
      size: document.getElementById("size").value,
      color: document.getElementById("color").value,
      price: document.getElementById("price").value,
      qty: document.getElementById("qty").value,
      threshold: document.getElementById("threshold").value,
      status: document.getElementById("status").value,
    };

    try {
      const response = await fetch(
        `http://localhost:3000/update-product/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        showAlert("success", "Product updated successfully!");
        setTimeout(() => {
          window.location.href = "products.html";
        }, 1500);
      } else if (data.status === 401) {
        showAlert("error", data.error);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        showAlert("error", data.error || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      showAlert("error", "An error occurred while updating the product");
    }
  });
});
