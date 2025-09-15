import { Platform } from "react-native";

/**
 * Get the appropriate API URL based on platform and environment
 */
export const getApiUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:9999";
  }

  // For Android emulator
  if (__DEV__ && Platform.OS === "android") {
    // Check if running on emulator (you can also use other methods to detect)
    return "http://10.0.2.2:9999"; // Android emulator special IP
  }

  // For iOS simulator
  if (__DEV__ && Platform.OS === "ios") {
    return "http://localhost:9999";
  }

  // For real devices, you need to replace this with your computer's IP
  return "http://10.33.65.199:9999"; // Replace with your actual IP
};

/**
 * Log network configuration for debugging
 */
export const logNetworkConfig = () => {
  console.log("=== Network Configuration ===");
  console.log("Platform:", Platform.OS);
  console.log("Development Mode:", __DEV__);
  console.log("API URL:", getApiUrl());
  console.log("=============================");
};

/**
 * Test API connection
 */
export const testApiConnection = async () => {
  try {
    const response = await fetch(getApiUrl());
    if (response.ok) {
      console.log("✅ API connection successful");
      return true;
    } else {
      console.log("❌ API connection failed:", response.status);
      return false;
    }
  } catch (error) {
    console.log("❌ API connection error:", error.message);
    return false;
  }
};

/**
 * Get network info for debugging
 */
export const getNetworkInfo = () => {
  return {
    platform: Platform.OS,
    isDev: __DEV__,
    apiUrl: getApiUrl(),
    userAgent: Platform.select({
      web: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      default: "React Native",
    }),
  };
};
