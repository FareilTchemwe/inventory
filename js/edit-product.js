// Load product details from URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Populate the form with product details
async function loadProductDetails() {
  try {
    const response = await fetch(
      `http://localhost:3000/get-product/${productId}`,
      {
        method: "GET",
      }
    );

    response.json().then((resp) => {
      if (resp && "product" in resp) {
        let product = resp.product;
        document.getElementById("product-id").value = product.id;
        document.getElementById("name").value = product.name;
        document.getElementById("size").value = product.size;
        document.getElementById("color").value = product.color;
        document.getElementById("price").value = product.price;
        document.getElementById("quantity").value = product.qty;
        document.getElementById("threshold").value = product.threshold;
        document.getElementById("status").value = product.status;
      } else {
        showAlert("error", resp.error);
      }
    });
  } catch (error) {
    showAlert("error", "Failed to load product details.");
  }
}

// Call the API to update the product
async function updateProduct() {
  const updatedProduct = {
    id: document.getElementById("product-id").value,
    name: document.getElementById("name").value,
    size: document.getElementById("size").value,
    color: document.getElementById("color").value,
    price: parseFloat(document.getElementById("price").value),
    qty: parseInt(document.getElementById("quantity").value),
    threshold: parseInt(document.getElementById("threshold").value),
    status: document.getElementById("status").value,
  };

  try {
    const response = await fetch(
      `http://localhost:3000/update-product/${updatedProduct.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      }
    );

    response.json().then((resp) => {
      if (resp && "success" in resp) {
        showAlert("success", "Product updated successfully!");
        setTimeout(() => {
          window.location.href = "products.html";
        }, 1500);
      } else {
        showAlert("error", resp.error);
      }
    });
  } catch (error) {
    showAlert("error", "Failed to update product.");
  }
}

// Load the product details on page load
loadProductDetails();
