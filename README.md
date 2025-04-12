# Inventory Management System

A modern, secure, and efficient inventory management system built with Node.js, Express, and MySQL. This system provides a comprehensive solution for managing products, user accounts, and inventory operations.

## 🌟 Features

- **User Authentication**

  - Secure login and registration
  - Password reset functionality
  - User profile management

- **Product Management**

  - Create, read, update, and delete products
  - Product inventory tracking
  - Detailed product information management

- **User Interface**

  - Responsive design with Bootstrap 5
  - Modern and intuitive interface
  - FontAwesome icons integration
  - Clean and professional layout

## 🛠️ Tech Stack

- **Backend**

  - Node.js
  - Express.js
  - MySQL
  - Bcrypt for password hashing

- **Frontend**

  - HTML5
  - CSS3
  - Bootstrap 5
  - FontAwesome 6
  - JavaScript

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- MySQL Server
- npm (Node Package Manager)

### Installation

1. Clone the repository:

   ```bash
   git clone [your-repository-url]
   cd inventory
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   SESSION_SECRET=your_session_secret
   ```

4. Initialize the database:

   - Import the `inventory.sql` file into your MySQL database

5. Start the server:

   ```bash
   node server.js
   ```

The application will be available at `http://localhost:3000`

The default username is `john`

The default password `hello`

## 📁 Project Structure

```
inventory/
├── css/              # Stylesheets
├── js/               # JavaScript files
├── node_modules/     # Dependencies
├── .env              # Environment variables
├── .gitignore        # Git ignore file
├── inventory.sql     # Database schema
├── package.json      # Project dependencies
├── server.js         # Main server file
└── HTML files        # Frontend pages
    ├── index.html
    ├── account.html
    ├── products.html
    ├── create-product.html
    ├── edit-product.html
    ├── edit-profile.html
    ├── new-user.html
    └── reset-password.html
```

## 🔒 Security Features

- Password hashing with bcrypt
- Session-based authentication
- Secure cookie handling
- Environment variable protection
- SQL injection prevention

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please open an issue in the repository or contact the maintainers.

---

Made by [Fareil Tchemwe]
