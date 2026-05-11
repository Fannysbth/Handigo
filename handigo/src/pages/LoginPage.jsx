import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from '@/components/Container';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, googleLogin } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) return;

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
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
        navigate('/complete-profile', {
          state: { email: result.email, full_name: result.full_name }
        });
      } else {
        toast.success('Login dengan Google berhasil!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Gagal login dengan Google');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password harus diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Gagal login. Periksa email dan password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.prompt();
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
        <div className="w-full max-w-md bg-light-blue rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary-blue mb-2">
            Selamat Datang!
          </h1>
          <p className="text-center text-primary-blue opacity-80 text-sm mb-6">
            Masuk untuk melanjutkan belajarmu
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
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

            <div className="relative">
              <label className="text-xs text-primary-blue">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary-blue pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-500 hover:scale-105 active:scale-95 transition-transform"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right text-xs text-primary-blue cursor-pointer hover:underline">
              Lupa Kata Sandi?
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 bg-primary-blue text-white py-2 rounded-full font-semibold hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? 'Masuk...' : 'Masuk'}
            </button>

            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-[1px] bg-gray-300"></div>
              <span className="text-xs text-gray-500">Atau</span>
              <div className="flex-1 h-[1px] bg-gray-300"></div>
            </div>

            <Link
              to="/register"
              className="bg-primary-blue text-white text-center py-2 rounded-full font-semibold hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all block"
            >
              Daftar Akun
            </Link>

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

export default LoginPage;