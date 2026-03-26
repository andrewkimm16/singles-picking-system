import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthUser, setAuthUser, clearAuthUser } from '../data/dataStore.js';
import { generateId } from '../utils/formatters.js';
import { ROLES } from '../utils/constants.js';

const AuthContext = createContext(null);

// Demo accounts for simulated SSO
export const DEMO_ACCOUNTS = [
  { userId: 'demo-customer-1', name: 'Andrew', email: 'andrew@newkawaii.com', role: ROLES.CUSTOMER },
  { userId: 'demo-staff-1', name: 'Paul (Staff)', email: 'paul@newkawaii.com', role: ROLES.STAFF },
  { userId: 'demo-admin-1', name: 'Levy (Admin)', email: 'levy@newkawaii.com', role: ROLES.ADMIN },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getAuthUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getAuthUser();
    if (stored) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const fullUser = {
      userId: userData.userId || generateId(),
      name: userData.name,
      email: userData.email,
      role: userData.role || ROLES.CUSTOMER,
      authenticated: true,
      sso_provider: 'shopify',
    };
    setAuthUser(fullUser);
    setUser(fullUser);
  };

  const logout = () => {
    clearAuthUser();
    setUser(null);
  };

  const isAuthenticated = !!user?.authenticated;
  const isStaff = user?.role === ROLES.STAFF || user?.role === ROLES.ADMIN;
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isStaff, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
