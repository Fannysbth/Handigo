import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from '@/components/Container';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      alert("Password tidak cocok!");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (error) {
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
          Buat Akun Baru
        </h1>
        <p className="text-center text-blue-800 text-sm mb-6">
          Bergabung dan mulai belajar bahasa isyarat hari ini
        </p>

        {/* FORM */}
        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          
          {/* NAMA */}
          <div>
            <label className="text-xs text-blue-900">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

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
            <label className="text-xs text-blue-900">Konfirmasi Password</label>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-300 pr-10"
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
            className="mt-2 bg-dark-gray text-white py-2 rounded-full font-semibold hover:opacity-90 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? 'Loading...' : 'Daftar'}
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
            className="bg-dark-gray text-white text-center py-2 rounded-full font-semibold hover:opacity-90 hover:scale-105 active:scale-95 transition-transform block"
          >
            Sudah punya akun? Masuk
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

export default RegisterPage;