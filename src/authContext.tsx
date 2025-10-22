import React, { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from './useAuth';

// Define the exact return type from useAuth
interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  teamToken: string | null;
  teamName: string | null;
  adminToken: string | null;
  adminUsername: string | null;
  loginTeam: (token: string, teamName: string) => void;
  loginAdmin: (token: string, username: string) => void; // Update this
  logoutTeam: () => void;
  logoutAdmin: () => void;
}

// Create context with the specific type
const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );    
};

export const useAuthContext = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};