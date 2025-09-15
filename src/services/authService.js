import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, logApiConfig } from '../config/api';

// Log API configuration for debugging
logApiConfig();

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Storage keys for local session management
const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me'
};

class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.token = null;
  }

  // Initialize authentication state
  async initialize() {
    try {
      const [token, userData, rememberMe] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME)
      ]);

      if (token && userData) {
        this.token = token;
        this.user = JSON.parse(userData);
        this.isAuthenticated = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error initializing auth:', error);
      return false;
    }
  }

  // Register new user
  async register(userData) {
    try {
      // Validate input
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('Vui lòng điền đầy đủ thông tin');
      }

      if (userData.password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }

      if (!this.isValidEmail(userData.email)) {
        throw new Error('Email không hợp lệ');
      }

      // Check if user already exists
      const existingUsers = await api.get(`/users?email=${userData.email.toLowerCase()}`);
      
      if (existingUsers.data.length > 0) {
        throw new Error('Email đã được sử dụng');
      }

      // Create new user
      const newUser = {
        email: userData.email.toLowerCase(),
        name: userData.name,
        age: userData.age || null,
        password: userData.password, // In real app, this should be hashed
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Create user via API
      const response = await api.post('/users', newUser);
      const createdUser = response.data;

      // Generate token (in real app, this would come from server)
      const token = this.generateToken(createdUser.id);

      // Set authentication state
      this.user = createdUser;
      this.token = token;
      this.isAuthenticated = true;

      // Save to local storage
      await this.saveAuthData(userData.rememberMe);

      return {
        success: true,
        user: createdUser,
        token: token
      };

    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Login user
  async login(email, password, rememberMe = false) {
    try {
      if (!email || !password) {
        throw new Error('Vui lòng điền đầy đủ thông tin');
      }

      // Find user by email
      const response = await api.get(`/users?email=${email.toLowerCase()}`);
      const users = response.data;

      if (users.length === 0) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      const user = users[0];

      // In real app, password would be hashed and verified on server
      // For demo purposes, we'll accept any password for existing users
      if (password.length < 6) {
        throw new Error('Mật khẩu không đúng');
      }

      // Generate token
      const token = this.generateToken(user.id);

      // Update last login
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString()
      };
      await api.patch(`/users/${user.id}`, { lastLogin: updatedUser.lastLogin });

      // Set authentication state
      this.user = updatedUser;
      this.token = token;
      this.isAuthenticated = true;

      // Save to local storage
      await this.saveAuthData(rememberMe);

      return {
        success: true,
        user: updatedUser,
        token: token
      };

    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Logout user
  async logout() {
    try {
      // Clear authentication state
      this.isAuthenticated = false;
      this.user = null;
      this.token = null;

      // Clear storage
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA)
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user is authenticated
  isLoggedIn() {
    return this.isAuthenticated && this.user && this.token;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get current token
  getToken() {
    return this.token;
  }

  // Update user profile
  async updateProfile(updateData) {
    try {
      if (!this.isAuthenticated) {
        throw new Error('User not authenticated');
      }

      // Update user data via API
      const response = await api.patch(`/users/${this.user.id}`, updateData);
      const updatedUser = response.data;

      // Update local user data
      this.user = updatedUser;
      
      // Save to local storage
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.user));

      return {
        success: true,
        user: this.user
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      if (!this.isAuthenticated) {
        throw new Error('User not authenticated');
      }

      if (newPassword.length < 6) {
        throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
      }

      // In real app, verify current password with server
      if (currentPassword.length < 6) {
        throw new Error('Mật khẩu hiện tại không đúng');
      }

      // In real app, this would be handled by server
      // For demo, we'll just return success
      return {
        success: true,
        message: 'Mật khẩu đã được thay đổi thành công'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete account
  async deleteAccount() {
    try {
      if (!this.isAuthenticated) {
        throw new Error('User not authenticated');
      }

      // Delete user from API
      await api.delete(`/users/${this.user.id}`);

      // Clear authentication state
      await this.logout();

      return {
        success: true,
        message: 'Tài khoản đã được xóa thành công'
      };

    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Helper methods
  async saveAuthData(rememberMe = false) {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, this.token),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.user)),
        AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe.toString())
      ]);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  }

  // Helper method to handle API errors
  handleApiError(error) {
    console.error('API Error:', error);
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error('Request error: ' + error.message);
    }
  }

  generateToken(userId) {
    // In real app, this would be a JWT token from server
    return `token_${userId}_${Date.now()}`;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Forgot password (placeholder for future implementation)
  async forgotPassword(email) {
    try {
      if (!this.isValidEmail(email)) {
        throw new Error('Email không hợp lệ');
      }

      // In real app, this would send reset email
      return {
        success: true,
        message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Reset password (placeholder for future implementation)
  async resetPassword(token, newPassword) {
    try {
      if (newPassword.length < 6) {
        throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
      }

      // In real app, this would verify token and update password
      return {
        success: true,
        message: 'Mật khẩu đã được đặt lại thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
