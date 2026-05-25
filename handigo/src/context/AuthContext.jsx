import { createContext, useContext, useState, useEffect } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  googleLogin,
  completeProfile as completeProfileAPI,
  updateProfile as updateProfileAPI,
} from '../lib/api';
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

  // AuthContext.jsx

const googleLoginHandler = async (credential) => {
  try {
    const result = await googleLogin(credential);
    // result: { needProfile: true, email, full_name, avatar_url }
    //      atau { needProfile: false, user: {...} }

    if (!result.needProfile) {
      const userData = await getMe();
      setUser(userData);
    }

    return result; // teruskan apa adanya, LoginPage yang handle routing
  } catch (err) {
    toast.error(err.message || 'Gagal login dengan Google');
    throw err;
  }
};

const completeProfile = async (email, password, full_name) => {
  try {
    await completeProfileAPI(email, password, full_name);
    // BE sudah set cookie, langsung ambil user
    const userData = await getMe();
    setUser(userData);
    // Tidak toast di sini — biarkan halaman yang memanggil yang toast
  } catch (err) {
    // Lempar ke pemanggil agar bisa handle sendiri
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
      await updateProfileAPI(data);
      const updated = await getMe();
      setUser(updated);
      toast.success('Profil berhasil diperbarui');
      return true;
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
