import { useState, useEffect, useCallback } from 'react';
import { getAuthToken, clearAuthToken } from '@/services/api';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setToken(getAuthToken());
    setIsLoading(false);
  }, []);

  /** Reload the token from localStorage (call after login). */
  const refresh = useCallback(() => {
    setToken(getAuthToken());
  }, []);

  /** Clear the token and mark the user as logged out. */
  const logout = useCallback(() => {
    clearAuthToken();
    setToken(null);
  }, []);

  return {
    token,
    isAuthenticated: token !== null,
    isLoading,
    refresh,
    logout,
  };
}
