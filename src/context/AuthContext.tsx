import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminSession {
  username: string;
  role: string;
  loggedInAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  adminUser: AdminSession | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'tajneed_admin_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminSession | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username === 'admin') {
          return parsed;
        }
      }
    } catch {
      // ignore parse error
    }
    return null;
  });

  const isAuthenticated = adminUser !== null;

  const login = (username: string, password: string): { success: boolean; error?: string } => {
    const cleanUser = username.trim();
    
    // Strict authentication check per user request:
    // User: admin (accepting 'admin' or 'Admin' case-insensitively)
    // Password: Admin (exact case-sensitive match)
    if (cleanUser.toLowerCase() === 'admin' && password === 'Admin') {
      const session: AdminSession = {
        username: 'admin',
        role: 'Administrator',
        loggedInAt: new Date().toISOString()
      };
      setAdminUser(session);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      } catch {
        // ignore storage error
      }
      return { success: true };
    }

    if (cleanUser.toLowerCase() !== 'admin') {
      return { success: false, error: 'Invalid username. Please enter "admin".' };
    }

    return { success: false, error: 'Incorrect password. Please enter "Admin".' };
  };

  const logout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
