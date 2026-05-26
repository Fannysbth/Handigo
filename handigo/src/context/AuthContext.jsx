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

  /**
   * =========================
   * CHECK AUTH ON APP LOAD
   * =========================
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getMe();

        // response = { user: {...} }
        setUser(response.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * =========================
   * REGISTER
   * =========================
   */
  const register = async (name, email, password) => {
    try {
      await registerUser(email, password, name);

      toast.success('Registrasi berhasil!');

      return true;
    } catch (err) {
      toast.error(err.message || 'Gagal registrasi');
      throw err;
    }
  };

  /**
   * =========================
   * LOGIN EMAIL
   * =========================
   */
  const login = async (email, password) => {
    try {
      await loginUser(email, password);

      const response = await getMe();

      setUser(response.user);

      toast.success('Login berhasil!');

      return true;
    } catch (err) {
      toast.error(err.message || 'Gagal login');
      throw err;
    }
  };

  /**
   * =========================
   * LOGIN GOOGLE
   * =========================
   */
  const googleLoginHandler = async (credential) => {
    try {
      /**
       * response:
       * {
       *   needProfile: true/false,
       *   user: {...}
       * }
       */
      const response = await googleLogin(credential);

      // Kalau user SUDAH punya password
      // langsung login
      if (!response.needProfile) {
        const me = await getMe();

        setUser(me.user);

        toast.success('Login Google berhasil!');
      }

      // teruskan response ke LoginPage
      return response;

    } catch (err) {
      toast.error(err.message || 'Gagal login dengan Google');
      throw err;
    }
  };

  /**
   * =========================
   * COMPLETE PROFILE
   * =========================
   */
  const completeProfile = async (email, password, full_name) => {
    try {
      await completeProfileAPI(email, password, full_name);

      // backend sudah set cookie
      const response = await getMe();

      setUser(response.user);

      return true;

    } catch (err) {
      toast.error(err.message || 'Gagal melengkapi profile');
      throw err;
    }
  };

  /**
   * =========================
   * UPDATE PROFILE
   * =========================
   */
  const updateProfile = async (data) => {
    try {
      await updateProfileAPI(data);

      const response = await getMe();

      setUser(response.user);

      toast.success('Profil berhasil diperbarui');

      return true;

    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui profil');
      throw err;
    }
  };

  /**
   * =========================
   * LOGOUT
   * =========================
   */
  const logout = async () => {
    try {
      await logoutUser();
      toast.success('Berhasil logout');
    } catch (err) {
      console.warn("Backend session already expired:", err.message);
      // Alih-alih memunculkan toast ganti dengan pesan yang bersahabat
      
    } finally {
      // PENTING: Apapun yang terjadi pada request API,
      // hapus data user dari state agar aplikasi kembali ke halaman login/awal.
      setUser(null);
    }
  };

  /**
   * =========================
   * CONTEXT VALUE
   * =========================
   */
  const value = {
    user,
    loading,

    register,
    login,
    logout,

    googleLogin: googleLoginHandler,
    completeProfile,

    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};