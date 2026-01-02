import { useState, useEffect, useCallback } from 'react';
import type { UserRole } from '@/types/remittance';

const ROLE_STORAGE_KEY = 'remittance-user-role';

export function useRole() {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(ROLE_STORAGE_KEY);
    if (stored === 'sender' || stored === 'recipient') {
      setRoleState(stored);
    }
    setIsLoading(false);
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
    setRoleState(newRole);
  }, []);

  const clearRole = useCallback(() => {
    localStorage.removeItem(ROLE_STORAGE_KEY);
    setRoleState(null);
  }, []);

  const toggleRole = useCallback(() => {
    const newRole = role === 'sender' ? 'recipient' : 'sender';
    setRole(newRole);
  }, [role, setRole]);

  return {
    role,
    setRole,
    clearRole,
    toggleRole,
    isLoading,
    isSender: role === 'sender',
    isRecipient: role === 'recipient',
  };
}
