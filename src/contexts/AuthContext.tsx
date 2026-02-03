import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { UserRole, RolePermissions, ROLE_PERMISSIONS, ROLE_LABELS } from '@/types/roles';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  permissions: RolePermissions | null;
  roleLabel: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: keyof RolePermissions) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - 3 roles
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'entry@hospital.com': {
    password: 'entry123',
    user: {
      id: '1',
      name: 'محمد علي',
      email: 'entry@hospital.com',
      role: 'data_entry',
    },
  },
  'supervisor@hospital.com': {
    password: 'super123',
    user: {
      id: '2',
      name: 'أحمد محمد',
      email: 'supervisor@hospital.com',
      role: 'supervisor',
    },
  },
  'partner@hospital.com': {
    password: 'partner123',
    user: {
      id: '3',
      name: 'خالد إبراهيم',
      email: 'partner@hospital.com',
      role: 'stakeholder',
    },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('surgical_user');
    return saved ? JSON.parse(saved) : null;
  });

  const permissions = useMemo(() => {
    if (!user) return null;
    return ROLE_PERMISSIONS[user.role];
  }, [user]);

  const roleLabel = useMemo(() => {
    if (!user) return '';
    return ROLE_LABELS[user.role];
  }, [user]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user);
      localStorage.setItem('surgical_user', JSON.stringify(mockUser.user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('surgical_user');
  }, []);

  const hasPermission = useCallback((permission: keyof RolePermissions): boolean => {
    if (!permissions) return false;
    return permissions[permission];
  }, [permissions]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    permissions,
    roleLabel,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
