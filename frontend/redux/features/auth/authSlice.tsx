// src/redux/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: null | {
    id: number;
    email: string;
    name: string;
    initials: string;
    role?: string[];
  };
  token: string | null;
  isAuthenticated: boolean;
}

// Helper function to load initial state from localStorage
const loadInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name || '',
            initials: user.initials || '',
            role: user.role || []
          },
          token: token,
          isAuthenticated: true,
        };
      }
    } catch (e) {
      console.error('Failed to parse stored auth state', e);
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      data: {
        token: string;
        userId: number;
        name: string;
        email: string;
        initials: string;
        role?: string[];
      };
    }>) => {
      const { data } = action.payload;
      
      state.user = {
        id: data.userId,
        email: data.email,
        name: data.name,
        initials: data.initials,
        role: data.role
      };
      
      state.token = data.token;
      state.isAuthenticated = true;
      
      // Update localStorage when credentials are set
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Clear all auth-related items from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    
    updateUser: (state, action: PayloadAction<Partial<AuthState['user']>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage as well
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;