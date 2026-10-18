import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, DemoAccount } from '../types.ts';
import { api } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  demoAccounts: DemoAccount[];
  login: (email: string, password: string) => Promise<User>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<User>;
  logout: () => Promise<void>;
  demoLogin: (role: UserRole) => Promise<User>;
  refreshUser: () => Promise<void>;
  isCustomer: boolean;
  isStaff: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [loading, setLoading] = useState<boolean>(true);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);

  // Load demo accounts list for evaluation
  useEffect(() => {
    api.auth.getDemoAccounts()
      .then(res => setDemoAccounts(res.accounts))
      .catch(err => {
        console.warn('Could not fetch demo accounts:', err);
        // Fallback default demo account credentials
        setDemoAccounts([
          {
            role: 'CUSTOMER',
            name: 'Alex Rivera',
            email: 'alex@rallyclub.com',
            password: 'RallyClub2026!',
            description: 'Customer account: browse courts, book sessions, manage reservations.'
          },
          {
            role: 'STAFF',
            name: 'Marcus Vance',
            email: 'marcus.staff@rallyclub.com',
            password: 'RallyStaff2026!',
            description: 'Staff account: view schedule, check-in players, block courts.'
          },
          {
            role: 'ADMIN',
            name: 'Elena Rostova',
            email: 'elena.admin@rallyclub.com',
            password: 'RallyAdmin2026!',
            description: 'Admin account: revenue analytics, staff provisioning, court pricing.'
          }
        ]);
      });
  }, []);

  // Check persistent session on initial mount
  const checkSession = useCallback(async () => {
    const savedToken = api.getToken();
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.auth.me();
      setUser(res.user);
      setToken(savedToken);
    } catch (err) {
      console.warn('Session restoration failed or expired:', err);
      api.clearToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.auth.login(email, password);
    setUser(res.user);
    setToken(res.token);
    return res.user;
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string }): Promise<User> => {
    const res = await api.auth.register(payload);
    setUser(res.user);
    setToken(res.token);
    return res.user;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    setToken(null);
  };

  const demoLogin = async (role: UserRole): Promise<User> => {
    let email = 'alex@rallyclub.com';
    let password = 'RallyClub2026!';

    if (role === 'STAFF') {
      email = 'marcus.staff@rallyclub.com';
      password = 'RallyStaff2026!';
    } else if (role === 'ADMIN') {
      email = 'elena.admin@rallyclub.com';
      password = 'RallyAdmin2026!';
    }

    return await login(email, password);
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      setUser(res.user);
    } catch {
      // ignore
    }
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const isStaff = user?.role === 'STAFF';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoAccounts,
        login,
        register,
        logout,
        demoLogin,
        refreshUser,
        isCustomer,
        isStaff,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
