import { Platform } from "react-native";

// Get your computer's IP address
// Windows: ipconfig
// Mac/Linux: ifconfig
// Replace this with your actual IP address
const HOST_IP = "10.33.65.199"; // Change this to your computer's IP

// API Configuration
export const API_CONFIG = {
  // For web development: use localhost
  // For mobile development: use your computer's IP address
  BASE_URL: __DEV__
    ? Platform.OS === "web"
      ? "http://localhost:9999"
      : Platform.OS === "android"
      ? "http://10.0.2.2:9999" // Android emulator
      : `http://${HOST_IP}:9999` // Real devices
    : "http://localhost:9999",

  TIMEOUT: 10000,

  HEADERS: {
    "Content-Type": "application/json",
  },
};

// Helper function to get API URL
export const getApiUrl = () => {
  return API_CONFIG.BASE_URL;
};

// Helper function to log current API configuration
export const logApiConfig = () => {
  console.log("=== API Configuration ===");
  console.log("Platform:", Platform.OS);
  console.log("Base URL:", API_CONFIG.BASE_URL);
  console.log("Development Mode:", __DEV__);
  console.log("Host IP:", HOST_IP);
  console.log("========================");
};
