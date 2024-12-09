// Handle form submission
const form = document.getElementById("addProductForm");
const messageElement = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission

  // Collect form data
  const name = document.getElementById("name").value;
  const size = document.getElementById("size").value;
  const color = document.getElementById("color").value;
  const price = parseFloat(document.getElementById("price").value);
  const qty = parseInt(document.getElementById("qty").value, 10);
  const threshold = parseInt(document.getElementById("threshold").value, 10);
  const status = document.getElementById("status").value;

  try {
    // Send a POST request to the /add-product API
    const response = await fetch("http://localhost:3000/add-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        size,
        color,
        price,
        qty,
        threshold,
        status,
      }),
    });

    response.json().then((resp) => {
      if (resp && "success" in resp) {
        showAlert("success", "Product added successfully!");
        form.reset;
        setTimeout(() => {
          window.location.href = "products.html";
        }, 1500);
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
    showAlert("error", "An error occurred. Please try again.");
  }
});
