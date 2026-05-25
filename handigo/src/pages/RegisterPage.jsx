import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from '@/components/Container';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { registerUser, googleLogin } from '../lib/api';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Load Google Identity Services script
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) return; // Already loaded

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID', // Ganti dengan client ID Anda
          callback: handleGoogleCallback,
        });
      };
    };

    loadGoogleScript();
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      const result = await googleLogin(response.credential);
      
      if (result.needProfile) {
        // Redirect ke halaman lengkapi profile
        navigate('/complete-profile', { 
          state: { email: result.email, full_name: result.full_name } 
        });
      } else {
        // Login sukses
        toast.success('Login dengan Google berhasil!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Gagal login dengan Google');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Semua field harus diisi!');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Password tidak cocok!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser(email, password, name);
      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (error) {
      console.error('Register error:', error);
      toast.error(error.message || 'Gagal registrasi. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.prompt(); // Show Google Sign-In prompt
      } else {
        toast.error('Google login belum siap. Coba lagi nanti.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Gagal login dengan Google');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 py-12 md:py-20">
      <Container className="flex-1 flex items-center justify-center h-full">
      
      {/* CARD */}
      <div className="w-full max-w-md bg-light-blue rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8">
        
        {/* TITLE */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary-blue mb-2">
          Buat Akun Baru
        </h1>
        <p className="text-center text-primary-blue opacity-80 text-sm mb-6">
          Bergabung dan mulai belajar bahasa isyarat hari ini
        </p>

        {/* FORM */}
        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          
          {/* NAMA */}
          <div>
            <label className="text-xs text-primary-blue">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary-blue"
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs text-primary-blue">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary-blue"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <label className="text-xs text-primary-blue">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password (min 6 karakter)"
              className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary-blue pr-10"
              required
              /* minLength={6} DIHAPUS AGAR DI-VALIDASI OLEH JAVASCRIPT & MENAMPILKAN TOAST EROR */
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:scale-105 active:scale-95 transition-transform"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* KONFIRM PASSWORD */}
          <div className="relative">
            <label className="text-xs text-primary-blue">Konfirmasi Password</label>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary-blue pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-[34px] text-gray-500 hover:scale-105 active:scale-95 transition-transform"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* BUTTON REGISTER */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-primary-blue text-white py-2 rounded-full font-semibold hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-[1px] bg-gray-300"></div>
            <span className="text-xs text-gray-500">Atau</span>
            <div className="flex-1 h-[1px] bg-gray-300"></div>
          </div>

          {/* LOGIN */}
          <Link
            to="/login"
            className="bg-primary-blue text-white text-center py-2 rounded-full font-semibold hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all block"
          >
            Sudah punya akun? Masuk
          </Link>

          {/* GOOGLE */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="bg-primary-blue text-white py-2 rounded-full flex items-center justify-center gap-2 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all"
          >
            <span className="text-lg">G</span> Google
          </button>

        </form>
      </div>
      </Container>
    </div>
  );
};

export default RegisterPage;