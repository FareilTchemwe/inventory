require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");
const MySQLStore = require("express-mysql-session")(session);

const app = express();

let userId;
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    process.exit(1); // Exit process if connection fails
  }
  console.log("Connected to database.");
});

// Session Store
const sessionStore = new MySQLStore({}, db);

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: true,
    saveUninitialized: false,
    cookie: {
      // maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: false,

      // secure: process.env.NODE_ENV === "production",
      // sameSite: "strict",
    },
  })
);

// Routes

// Updated registration route to include first name, last name, username, and password
app.post("/register", async (req, res) => {
  const { firstName, lastName, username, password } = req.body;

  // Input Validation
  if (!firstName || !lastName || !username || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Insert user data into the database
    const query =
      "INSERT INTO users (first_name, last_name, username, password) VALUES (?, ?, ?, ?)";
    db.query(
      query,
      [firstName.trim(), lastName.trim(), username.trim(), hashedPassword],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        return res.status(201).json({ success: 1 });
      }
    );
  } catch (error) {
    console.error("Error hashing password:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }
  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username.trim()], async (err, results) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    userId = user.id;
    return res.status(200).json({ success: 1 });
  });
});

app.put("/reset-pass", async (req, res) => {
  if (userId == null) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  const { oldPassword, newPassword } = req.body;
  // Check if both old and new password are provided
  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Old password and new password are required." });
  }

  // 1. Get the user from the database
  const getUserQuery = "SELECT * FROM users WHERE id = ?";

  db.query(getUserQuery, [userId], async (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching user data." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = results[0]; // Get the first user from the results

    // 2. Compare the old password with the stored password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect." });
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update the user's password with the new hashed password
    const updatePasswordQuery = "UPDATE users SET password = ? WHERE id = ?";

    db.query(
      updatePasswordQuery,
      [hashedPassword, userId],
      (updateErr, updateResults) => {
        if (updateErr) {
          console.error("Error updating password:", updateErr);
          return res
            .status(500)
            .json({ error: "An error occurred while updating the password." });
        }

        res.json({ success: "Password updated successfully!" });
      }
    );
  });
});
// Edit user route
app.put("/edit-user", async (req, res) => {
  if (userId == null) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  const { firstname, lastname, username } = req.body;

  // Input validation
  if (!firstname || !lastname || !username) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // SQL Query to get the stored password hash
    const query = "SELECT username FROM users WHERE id = ?";

    db.execute(query, [userId], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Internal Server Error userid" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // SQL Query to update user details with the new password
      const updateQuery =
        "UPDATE users SET first_name = ?, last_name = ?, username = ? WHERE id = ?";

      db.execute(
        updateQuery,
        [firstname.trim(), lastname.trim(), username.trim(), userId],
        (err, results) => {
          if (err) {
            console.error("Error updating user data:", err);
            return res
              .status(500)
              .json({ error: "Internal Server Error update" });
          }

          return res
            .status(200)
            .json({ success: 1, message: "User details updated successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "Internal Server Error all" });
  }
});

// Get user details using a SELECT query
app.get("/get-user", (req, res) => {
  if (userId == null) {
    return res.json({ success: false, error: "User not logged in" });
  }

  const query =
    "SELECT first_name, last_name, username FROM users WHERE id = ?";

  // Execute the query
  db.execute(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.json({ error: "An error occurred" });
    }

    if (results.length === 0) {
      return res.json({ error: "User not found" });
    }

    const user = results[0]; // The first (and should be the only) result
    res.json({
      success: true,
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
      },
    });
  });
});

// Logout Route (for session-based authentication)
app.post("/logout", (req, res) => {
  if (userId == null) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "An error occurred during logout." });
    }
    res.json({ success: "Logged out successfully." });
  });
});

app.get("/get-products", (req, res) => {
  if (userId == null) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    res.status(200).json({ products: results });
  });
});

// Get Product by ID
app.get("/get-product/:id", (req, res) => {
  if (userId == null) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  const productId = req.params.id;

  const query = "SELECT * FROM products WHERE id = ?";
  db.query(query, [productId], (err, result) => {
    if (err) {
      console.error("Error fetching product:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the product." });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    res.status(200).json({ product: result[0] });
  });
});

// Add Product Route
app.post("/add-product", (req, res) => {
  if (userId == null) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  const { name, size, color, price, qty, threshold, status } = req.body;

  // Validate required fields
  if (!name || !size || !color || !price || !qty || !threshold || !status) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  const query = `
    INSERT INTO products (name, size, color, price, qty, threshold, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, size, color, price, qty, threshold, status],
    (err, result) => {
      if (err) {
        console.error("Error adding product:", err);
        res
          .status(500)
          .json({ error: "An error occurred while adding the product." });
        return;
      }

      res.status(201).json({
        success: 1,
        productId: result.insertId,
      });
    }
  );
});

// Update Existing Product - PUT /products/:id
app.put("/update-product/:id", (req, res) => {
  if (userId == null) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  const { id } = req.params; // Product ID from URL
  const { name, size, color, price, qty, status, threshold } = req.body; // Updated product details from request body

  // Input Validation
  if (!name || !size || !color || !price || !qty || !status || !threshold) {
    return res.status(400).json({ error: "All product fields are required." });
  }

  // SQL query to update product details
  const updateQuery =
    "UPDATE products SET name = ?, qty = ?, price = ?, size = ?, color = ?, status = ?, threshold = ? WHERE id = ?";
  db.query(
    updateQuery,
    [
      name.trim(),
      qty,
      price,
      size.trim(),
      color.trim(),
      status.trim(),
      threshold,
      id,
    ],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Product not found." });
      }

      return res.status(200).json({ success: 1 });
    }
  );
});

// Delete Product - DELETE /products/:id
app.delete("/delete-product/:id", (req, res) => {
  if (userId == null) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  const { id } = req.params; // Product ID from URL

  // SQL query to delete the product
  const deleteQuery = "DELETE FROM products WHERE id = ?";
  db.query(deleteQuery, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found." });
    }

    return res.status(200).json({ success: 1 });
  });
});

// Shop Route (POST) to update product quantity based on the purchase
app.post("/shop", (req, res) => {
  if (userId == null) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity) {
    return res
      .status(400)
      .json({ error: "Product ID and quantity are required." });
  }

  // Get the current quantity and threshold from the products table
  const query = `SELECT qty, threshold FROM products WHERE id = ?`;

  db.query(query, [product_id], (err, results) => {
    if (err) {
      console.error("Error fetching product data:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch product details." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }

    const currentQty = results[0].qty;
    const threshold = results[0].threshold;
    const remainder = currentQty - quantity;

    let updateQuery;

    if (remainder <= threshold && remainder !== 0) {
      // Update status to 'nearly finished' if remainder is below threshold
      updateQuery = `UPDATE products SET qty = ?, status = 'nearly finished' WHERE id = ?`;
    } else if (remainder === 0) {
      // Update status to 'finished' if remainder is 0
      updateQuery = `UPDATE products SET qty = ?, status = 'finished' WHERE id = ?`;
    } else {
      // Update only quantity if none of the above conditions are met
      updateQuery = `UPDATE products SET qty = ? WHERE id = ?`;
    }

    // Perform the update query
    db.query(updateQuery, [remainder, product_id], (err, updateResults) => {
      if (err) {
        console.error("Error updating product data:", err);
        return res.status(500).json({ error: "Failed to update product." });
      }

      res.status(200).json({ success: 1 });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
