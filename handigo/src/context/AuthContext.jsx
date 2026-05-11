import { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, loginUser, logoutUser, getMe, googleLogin, completeProfile as completeProfileAPI } from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const register = async (name, email, password) => {
    try {
      await registerUser(email, password, name);
      toast.success('Registrasi berhasil! Silakan login.');
      return true;
    } catch (err) {
      toast.error(err.message || 'Gagal registrasi');
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      await loginUser(email, password);
      const userData = await getMe();
      setUser(userData);
      toast.success('Login berhasil!');
      return true;
    } catch (err) {
      toast.error(err.message || 'Gagal login');
      throw err;
    }
  };

  const googleLoginHandler = async (credential) => {
    try {
      const result = await googleLogin(credential);

      if (!result.needProfile) {
        const userData = await getMe();
        setUser(userData);
      }

      return result;
    } catch (err) {
      toast.error(err.message || 'Gagal login dengan Google');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      toast.success('Berhasil keluar');
    } catch (err) {
      toast.error('Gagal keluar');
      throw err;
    }
  };

  const updateProfile = async (data) => {
    try {
      // implementasi updateProfile jika ada di api.js
      // await updateProfileAPI(data);
      // const updatedUser = await getMe();
      // setUser(updatedUser);
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      toast.error('Gagal memperbarui profil');
      throw err;
    }
  };

  const completeProfile = async (email, password, full_name) => {
    try {
      await completeProfileAPI(email, password, full_name);
      const userData = await getMe();
      setUser(userData);
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui profil');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    completeProfile,
    googleLogin: googleLoginHandler,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
