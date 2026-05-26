import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from '@/components/Container';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // 1. TANGKAP TOKEN SETELAH KEMBALI DARI GOOGLE
  // ==========================================
  useEffect(() => {
    // Google akan melempar token di URL dengan format: #id_token=...
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const idToken = params.get('id_token');

    if (idToken) {
      // Bersihkan URL dari token yang panjang agar rapi dilihat user
      window.history.replaceState(null, null, window.location.pathname);

      // Proses token ke backend kamu
      googleLogin(idToken).then((result) => {
        if (result.needProfile) {
          navigate('/complete-profile', {
            state: { email: result.email, full_name: result.full_name },
          });
        } else {
          toast.success('Login dengan Google berhasil!');
          navigate('/dashboard');
        }
      })// Di dalam LoginPage.jsx
googleLogin(idToken).then((result) => {
  // Tambahkan console.log ini untuk mengintip struktur asli data dari backend
  console.log("Hasil dari backend Google Login:", result);

  if (result?.needProfile) {
    // Ambil dari result.user (sesuai struktur res.json backend kamu)
    const emailData = result.user?.email;
    const nameData = result.user?.full_name;

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
    const redirectUri = 'http://localhost:5173/login'; // Halaman ini sendiri
    const scope = 'email profile openid';
    const responseType = 'id_token';
    const nonce = Math.random().toString(36).substring(2); // Wajib untuk keamanan token

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&nonce=${nonce}`;

    // Lempar user ke halaman utama Google
    window.location.href = googleAuthUrl;
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

  return (
    <div className="flex-1 flex flex-col bg-gray-100 py-12 pt-20 md:py-20">
      <Container className="flex-1 flex items-center justify-center h-full">
        <div className="w-100 max-w-md bg-light-blue rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8">

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary-blue mb-2">
            Selamat Datang!
          </h1>
          <p className="text-center text-primary-blue opacity-80 text-sm mb-6">
            Masuk untuk melanjutkan belajarmu
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
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

            <div className="text-right text-xs text-primary-blue cursor-pointer hover:underline w-full">
              Lupa Kata Sandi?
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-primary-blue text-white py-2 rounded-full font-semibold hover:bg-primary-hover transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Masuk..." : "Masuk"}
            </button>

            <div className="flex items-center gap-2 my-2 w-full">
              <div className="flex-1 h-[1px] bg-gray-300"></div>
              <span className="text-xs text-gray-500">Atau</span>
              <div className="flex-1 h-[1px] bg-gray-300"></div>
            </div>

            <Link
              to="/register"
              className="w-full bg-primary-blue text-white text-center py-2 rounded-full font-semibold hover:bg-primary-hover transition-all block"
            >
              Daftar Akun
            </Link>

            {/* TOMBOL GOOGLE KUSTOM */}
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

export default LoginPage;