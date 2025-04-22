// auth.js - Client-side authentication utilities

// Constants
const API_URL = "https://inventory-server-five.vercel.app"; // Adjust to your API URL
const TOKEN_KEY = "auth_token";
const TOKEN_EXPIRY_KEY = "auth_token_expiry";

// Function to store authentication data
function setAuthData(token, expiresIn) {
  const expiryDate = new Date();
  // Convert expiresIn (e.g., '24h') to milliseconds and add to current time
  const expiryTime = parseExpiryTime(expiresIn);
  expiryDate.setTime(expiryDate.getTime() + expiryTime);

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toString());

  // Optional: Set up automatic token refresh
  scheduleTokenRefresh(expiryTime);
}

// Parse expiry time from string like '24h' to milliseconds
function parseExpiryTime(expiresIn) {
  const match = expiresIn.match(/^(\d+)([hmd])$/);
  if (!match) return 24 * 60 * 60 * 1000; // Default: 24 hours

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "h": // hours
      return value * 60 * 60 * 1000;
    case "m": // minutes
      return value * 60 * 1000;
    case "d": // days
      return value * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000; // Default: 24 hours
  }
}

// Function to get the authentication token
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Function to check if user is authenticated
function isAuthenticated() {
  const token = getToken();
  const expiryDate = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiryDate) {
    return false;
  }

  // Check if token has expired
  return new Date(expiryDate) > new Date();
}

// Function to log out user
function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  window.location.href = "/login.html"; // Adjust to your login page URL
}

// Function to redirect to login if not authenticated
function redirectIfNotAuthenticated() {
  if (!isAuthenticated()) {
    logout(); // This will redirect to login
  }
}

// Function to set up automatic token refresh
function scheduleTokenRefresh(expiryTime) {
  // Refresh the token 5 minutes before it expires
  const refreshTime = expiryTime - 5 * 60 * 1000;

  setTimeout(() => {
    // Only refresh if user is still authenticated
    if (isAuthenticated()) {
      refreshToken();
    }
  }, refreshTime);
}

// Function to refresh token
async function refreshToken() {
  try {
    const response = await fetch(`${API_URL}/refresh-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    setAuthData(data.token, data.expiresIn);
  } catch (error) {
    console.error("Failed to refresh token:", error);
    logout();
  }
}

// Expose functions globally
window.setAuthData = setAuthData;
window.parseExpiryTime = parseExpiryTime;
window.getToken = getToken;
window.isAuthenticated = isAuthenticated;
window.logout = logout;
window.redirectIfNotAuthenticated = redirectIfNotAuthenticated;
window.scheduleTokenRefresh = scheduleTokenRefresh;
window.refreshToken = refreshToken;
