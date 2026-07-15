import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { username }
  const [token, setToken]     = useState(() => localStorage.getItem('ab_token'));
  const [loading, setLoading] = useState(true);   // true while validating stored token

  // On mount — try to restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('ab_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(r => setUser({ username: r.data.username }))
      .catch(() => {
        // Token expired or invalid — clear it
        localStorage.removeItem('ab_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((newToken, username) => {
    localStorage.setItem('ab_token', newToken);
    setToken(newToken);
    setUser({ username });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ab_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
