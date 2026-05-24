import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from '@/components/Container';
import toast from 'react-hot-toast';

import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, googleLogin } = useAuth();
 const initialized = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
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
      toast.error(error.message || 'Gagal login. Periksa email dan password.');
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
  let script;

  const loadGoogleScript = () => {
    if (document.getElementById("gsi-script")) return;

    script = document.createElement("script");
    script.id = "gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (initialized.current) return;
      initialized.current = true;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        {
          theme: "outline",
          size: "large",
          width: 300,
          text: "signin_with",
          shape: "pill",
        }
      );
    };

    document.head.appendChild(script);
  };

  loadGoogleScript();

  return () => {
    if (script) {
      script.remove();
    }
  };
}, []);

  
  return (
    <div className="flex-1 flex flex-col bg-gray-100 py-12 md:py-20">
      <Container className="flex-1 flex items-center justify-center h-full">
        
        <div className="w-100 max-w-md bg-light-blue rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8">

          {/* HEADER */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary-blue mb-2">
            Selamat Datang!
          </h1>

          <p className="text-center text-primary-blue opacity-80 text-sm mb-6">
            Masuk untuk melanjutkan belajarmu
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="w-full">
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
            <div className="relative w-full">
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
                className="absolute right-3 top-[34px] text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* FORGOT PASSWORD */}
            <div className="text-right text-xs text-primary-blue cursor-pointer hover:underline w-full">
              Lupa Kata Sandi?
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-primary-blue text-white py-2 rounded-full font-semibold hover:bg-primary-hover transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Masuk..." : "Masuk"}
            </button>

            {/* DIVIDER */}
            <div className="flex items-center gap-2 my-2 w-full">
              <div className="flex-1 h-[1px] bg-gray-300"></div>
              <span className="text-xs text-gray-500">Atau</span>
              <div className="flex-1 h-[1px] bg-gray-300"></div>
            </div>

            {/* REGISTER BUTTON */}
            <Link
              to="/register"
              className="w-full bg-primary-blue text-white text-center py-2 rounded-full font-semibold hover:bg-primary-hover transition-all block"
            >
              Daftar Akun
            </Link>

            {/* GOOGLE BUTTON (FULL FIX) */}
            <div className="w-full mt-3">
              <div
                id="googleBtn"
                className="w-full flex justify-center"
              ></div>
            </div>

          </form>
        </div>

      </Container>
    </div>
  );
};

export default LoginPage;