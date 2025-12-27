import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const AuthContext = createContext();
import { baseURL } from "../config"

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};


export default function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage('user', 'null');
  const navigate = useNavigate();

  // Optional: fetch user on mount (e.g. check if still logged in)
  

  const login = async (credentials) => {
    const res = await fetch(`${baseURL}/auth/login/`, {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    

    if (!res.ok) {
      return false
    }

    const data = await res.json();
    localStorage.setItem("name", JSON.stringify(data.user.fullName));
      localStorage.setItem("token", data.accessToken);
      return true

  };

  const signUp = async (credentials) => {
    const response = await fetch(`${baseURL}/auth/signup/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });

    

    if (!response.ok) {
      const result = await response.json();
      if(result.message === 'email or Username unavailable') {
        return 'email or Username unavailable'
      }
        throw response.message || 'Login failed';
      }
      
      const data = await response.json();
      localStorage.setItem("name", JSON.stringify(data.user.fullName));
      localStorage.setItem("token", data.accessToken);
      return true
    };

  const refresh = async () => {
    const res = await fetch(`${baseURL}/auth/refresh-token/`, {
      method: 'GET',
      credentials: 'include',
    });

    if(!res.ok) {
      localStorage.clear();
      return false
    }

    const data = await res.json()
    localStorage.setItem("name", JSON.stringify(data.user.fullName));
    localStorage.setItem("token", data.accessToken);
    return true

  }

  const logout = async () => {
    
    navigate('/login', { replace: true });
    localStorage.clear()
    const res = await fetch(`${baseURL}/auth/logout/`, { method: 'GET', credentials: 'include' });
    setUser(null);
  };

  const googleAuth = async (googleToken) => {
    const response = await fetch(`${baseURL}/auth/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token: googleToken }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    localStorage.setItem("token", data.accessToken);
    setUser(data.user.prenom);
    return true;
  };

  return (
    <AuthContext.Provider value={{user, setUser, signUp, login, logout, refresh, googleAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
