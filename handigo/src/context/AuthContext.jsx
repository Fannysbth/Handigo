import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('handigo_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'test@handigo.id' && password === 'password') {
          const userData = { email, name: 'Miaung Tester' };
          setUser(userData);
          localStorage.setItem('handigo_user', JSON.stringify(userData));
          toast.success('Berhasil login!');
          resolve(userData);
        } else {
          toast.error('Email atau password salah. (Gunakan: test@handigo.id / password)');
          reject(new Error('Invalid credentials'));
        }
      }, 1000); // Simulate network delay
    });
  };

  const register = async (name, email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password) {
          const userData = { email, name };
          setUser(userData);
          localStorage.setItem('handigo_user', JSON.stringify(userData));
          toast.success('Berhasil mendaftar dan login!');
          resolve(userData);
        } else {
          toast.error('Semua kolom harus diisi.');
          reject(new Error('Invalid missing data'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('handigo_user');
    toast.success('Berhasil keluar!');
  };

  const updateProfile = async (newData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updated = { ...user, ...newData };
        setUser(updated);
        localStorage.setItem('handigo_user', JSON.stringify(updated));
        toast.success('Profil berhasil diperbarui!');
        resolve(updated);
      }, 800);
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
