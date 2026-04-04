import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from '@/components/Container';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled by toast in AuthContext
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 py-12 md:py-20">
      <Container className="flex-1 flex items-center justify-center h-full">
      
      {/* CARD */}
      <div className="w-full max-w-md bg-blue-100 rounded-3xl shadow-lg p-8">
        
        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">
          Selamat Datang!
        </h1>
        <p className="text-center text-blue-800 text-sm mb-6">
          Masuk untuk melanjutkan belajarmu
        </p>

        {/* FORM */}
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          
          {/* EMAIL */}
          <div>
            <label className="text-xs text-blue-900">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <label className="text-xs text-blue-900">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-300 pr-10"
              required
            />
            
            {/* TOGGLE */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:scale-105 active:scale-95 transition-transform"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* FORGOT */}
          <div className="text-right text-xs text-blue-800 cursor-pointer hover:underline">
            Lupa Kata Sandi?
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-dark-gray text-white py-2 rounded-full font-semibold hover:opacity-90 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? 'Loading...' : 'Masuk'}
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-[1px] bg-gray-300"></div>
            <span className="text-xs text-gray-500">Atau</span>
            <div className="flex-1 h-[1px] bg-gray-300"></div>
          </div>

          {/* REGISTER */}
          <Link
            to="/register"
            className="bg-dark-gray text-white text-center py-2 rounded-full font-semibold hover:opacity-90 hover:scale-105 active:scale-95 transition-transform block"
          >
            Daftar Akun
          </Link>

          {/* GOOGLE */}
          <button
            type="button"
            className="bg-dark-gray text-white py-2 rounded-full flex items-center justify-center gap-2 hover:opacity-90 hover:scale-105 active:scale-95 transition-transform"
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