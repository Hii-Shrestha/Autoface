import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: true,
    user: null, // 👈 Start with null, don't trust old localStorage here
  });

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthState({ token: null, isAuthenticated: false, loading: false, user: null });
      return;
    }
    try {
      const res = await axios.get('https://autoface.onrender.com/api/auth/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // 🛡️ Strict Check: Agar token aur user data match nahi karte toh clear karo
      if (res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setAuthState({ token, isAuthenticated: true, loading: false, user: res.data });
      }
    } catch (err) {
      logout(); // 👈 Kisi bhi error par sidha logout
    }
  };

  useEffect(() => { loadUser(); }, []);

  const login = async (email, password) => {
    // ⚡ Login se pehle purana kachra saaf karo
    localStorage.clear(); 
    
    const res = await axios.post('https://autoface.onrender.com/api/auth/login', { email, password });
    const { token, user } = res.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setAuthState({ token, isAuthenticated: true, loading: false, user });
    return user;
  };

  const logout = () => {
    localStorage.clear();
    setAuthState({ token: null, isAuthenticated: false, loading: false, user: null });
    // 🚀 Force redirect with refresh to kill any remaining React State
    window.location.replace('/login'); 
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('https://autoface.onrender.com/api/auth/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      setAuthState(prev => ({ ...prev, user: res.data }));
    } catch (err) { console.error("Sync failed"); }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};