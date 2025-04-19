// Handle form submission
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("create-product-form");
  const messageElement = document.getElementById("message");

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
      const response = await fetch("http://localhost:3000/create-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log(data);
      if (data.success) {
        showAlert("success", "Product created successfully!");
        setTimeout(() => {
          window.location.href = "products.html";
        }, 1500);
      } else if (data.status === 401) {
        showAlert("error", data.error);
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } else {
        showAlert("error", data.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      showAlert("error", "An error occurred while creating the product");
    }
  });
});
