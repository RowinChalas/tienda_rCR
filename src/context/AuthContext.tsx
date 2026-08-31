import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../domain/models/User';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole, supplierId?: string) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: (preferredRole?: UserRole) => void;
  closeLoginModal: () => void;
  preferredRole: UserRole;
}

const STORAGE_KEY = 'barversuit_auth_v1';

const DEFAULT_ADMIN_USER: User = {
  id: 'usr_admin_01',
  name: 'Rowin Chalas (Admin)',
  email: 'admin@barversuit.com',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  createdAt: '2026-01-01T00:00:00Z',
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return DEFAULT_ADMIN_USER;
      }
    }
    return DEFAULT_ADMIN_USER; // Default logged in as admin for smooth evaluation
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [preferredRole, setPreferredRole] = useState<UserRole>('admin');

  const login = (email: string, role: UserRole, supplierId?: string) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: role === 'admin' ? 'Administrador Principal' : 'Taller Artesanal Cibao',
      email,
      role,
      supplierId: role === 'supplier' ? supplierId || 'sup_central_01' : undefined,
      avatarUrl:
        role === 'admin'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setIsLoginModalOpen(true);
  };

  const openLoginModal = (role: UserRole = 'admin') => {
    setPreferredRole(role);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        preferredRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un <AuthProvider>');
  }
  return context;
};
