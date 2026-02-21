import { createContext, useContext, useState, useEffect } from 'react';
import { endpoints } from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
    // 🟢 MULTI-TAB LOGOUT SYNC FIX
    // If a user logs out in Tab A, 'user' is removed from localStorage.
    // Tab B detects this storage change and instantly logs out.
    const handleStorageChange = (e) => {
      if (e.key === 'user' && e.newValue === null) {
        setUser(null);
        toast.error('Logged out from another tab or window.');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await endpoints.auth.login(credentials);
      if (data.success) {

        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);

        toast.success(`Welcome back, ${data.data.user.fullName}`);
        return true;
      }
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const logout = async () => {
    try{
   await endpoints.auth.logout(); 
    } catch (error) {
      console.error("Backend logout failed", error);
    } finally {
      // Clear local state (Triggers the cross-tab sync automatically!)
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };
const updateUser = (newUserData) => {
    setUser((prevUser) => {
      const updated = { ...prevUser, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updated)); // Persist to storage
      return updated;
    });
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);