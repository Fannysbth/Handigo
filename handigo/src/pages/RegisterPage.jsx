import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from '@/components/Container';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
// 1. Hapus googleLogin dari sini jika menggunakan yang dari context
import { registerUser } from '../lib/api'; 
// 2. Import useAuth dari file context Anda (sesuaikan path-nya!)
import { useAuth } from '../context/AuthContext'; 

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // 3. useAuth sekarang sudah bisa digunakan
  const { login, googleLogin } = useAuth(); 
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // 1. TANGKAP TOKEN SETELAH KEMBALI DARI GOOGLE
  // ==========================================
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const idToken = params.get('id_token');

    if (idToken) {
      // Bersihkan URL dari token
      window.history.replaceState(null, null, window.location.pathname);

      // 4. Blok copy-paste yang berantakan sudah diperbaiki menjadi satu logika yang rapi
      googleLogin(idToken).then((result) => {
        console.log("Hasil dari backend Google Login:", result);

        if (result?.needProfile) {
          // Sesuaikan dengan struktur response dari backend Anda
          const emailData = result.user?.email || result.email;
          const nameData = result.user?.full_name || result.full_name;

          if (!emailData || !nameData) {
            toast.error('Gagal mengambil data profil dari Google.');
            return;
          }

          navigate('/complete-profile', {
            state: { email: emailData, full_name: nameData },
          });
        } else {
          toast.success('Login dengan Google berhasil!');
          navigate('/dashboard');
        }
      }).catch((err) => {
        console.error(err);
        toast.error('Gagal memproses login Google dari backend');
      });
    }
  }, [googleLogin, navigate]);

  // ==========================================
  // 2. FUNGSI REDIRECT KE HALAMAN LOGIN GOOGLE
  // ==========================================
  const handleGoogleRedirect = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = 'http://localhost:5173/login'; // Pertimbangkan mengganti ini ke /register atau /auth/callback tergantung setup Anda
    const scope = 'email profile openid';
    const responseType = 'id_token';
    const nonce = Math.random().toString(36).substring(2);

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&nonce=${nonce}`;

    window.location.href = googleAuthUrl;
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

  return (
    <div className="flex-1 flex flex-col bg-gray-100 pt-20 py-12 md:py-20">
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
          <div className="w-full mt-3">
              <button
                type="button"
                onClick={handleGoogleRedirect}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2 rounded-full font-semibold hover:bg-gray-50 transition-all shadow-sm"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Lanjutkan dengan Google
              </button>
            </div>

        </form>
      </div>
      </Container>
    </div>
  );
};

export default RegisterPage;