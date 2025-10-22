import { useState, useEffect, useCallback } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  teamToken: string | null;
  teamName: string | null;
  adminToken: string | null;
  adminUsername: string | null; // Add this
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
    teamToken: null,
    teamName: null,
    adminToken: null,
    adminUsername: null, // Add this
  });

  useEffect(() => {
    // Check for team authentication
    const teamToken = localStorage.getItem('team_token');
    const teamName = localStorage.getItem('team_name');
    
    // Check for admin authentication
    const adminToken = localStorage.getItem('admin_token');
    const adminUsername = localStorage.getItem('admin_username'); // Add this
    
    setAuthState({
      isAuthenticated: !!teamToken,
      isAdmin: !!adminToken,
      isLoading: false,
      teamToken,
      teamName,
      adminToken,
      adminUsername, // Add this
    });
  }, []);

  const loginTeam = useCallback((token: string, teamName: string) => {
    localStorage.setItem('team_token', token);
    localStorage.setItem('team_name', teamName);
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: true,
      teamToken: token,
      teamName,
    }));
  }, []);

  // Update loginAdmin to accept username
  const loginAdmin = useCallback((token: string, username: string) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_username', username); // Store username
    setAuthState(prev => ({
      ...prev,
      isAdmin: true,
      adminToken: token,
      adminUsername: username, // Set username
    }));
  }, []);

  const logoutTeam = useCallback(() => {
    localStorage.removeItem('team_token');
    localStorage.removeItem('team_name');
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: false,
      teamToken: null,
      teamName: null,
    }));
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username'); // Remove username
    setAuthState(prev => ({
      ...prev,
      isAdmin: false,
      adminToken: null,
      adminUsername: null, // Clear username
    }));
  }, []);

  return {
    ...authState,
    loginTeam,
    loginAdmin,
    logoutTeam,
    logoutAdmin,
  };
};