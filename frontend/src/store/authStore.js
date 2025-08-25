import { create } from 'zustand';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  isAuthenticated: false, // Will be set to true after validating token

  signup: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.signup(userData);
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      toast.success('Account created successfully!');
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signin: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.signin(credentials);
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      toast.success('Welcome back!');
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
    toast.success('Signed out successfully');
  },

  updateProfile: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ 
        user: updatedUser, 
        isLoading: false 
      });
      
      toast.success('Profile updated successfully!');
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  refreshUser: async () => {
    try {
      const response = await authAPI.getProfile();
      const { user } = response;
      
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
      
      return response;
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },

  // Validate stored token and initialize auth state
  validateToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false });
      return false;
    }

    try {
      // Try to get user profile with the stored token
      const response = await authAPI.getProfile();
      const { user } = response;
      
      // Token is valid, update state
      localStorage.setItem('user', JSON.stringify(user));
      set({ 
        user, 
        isAuthenticated: true 
      });
      return true;
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      });
      return false;
    }
  },

  // Initialize auth state on app load
  initializeAuth: async () => {
    set({ isLoading: true });
    await get().validateToken();
    set({ isLoading: false });
  }
}));

export default useAuthStore;
