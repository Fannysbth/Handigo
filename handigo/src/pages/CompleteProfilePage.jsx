import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Container from '@/components/Container';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
// Import ikon mata (pastikan sudah install react-icons, atau sesuaikan dengan ikon bawaan proyekmu)
import { FiEye, FiEyeOff } from 'react-icons/fi'; 

const CompleteProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Tangkap data dari router state
  const { email, full_name } = location.state || {};

  const { completeProfile } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk toggle sembunyikan/lihat password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!email || !full_name) {
      toast.error('Data login tidak ditemukan, silakan login kembali.');
      navigate('/login', { replace: true });
    }
  }, [email, full_name, navigate]);

  if (!email || !full_name) {
    return null; 
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeProfile(email, password, full_name);
      
      // HAPUS DATA SEMENTARA SETELAH SUKSES
      sessionStorage.removeItem('temp_email');
      sessionStorage.removeItem('temp_fullname');
      
      toast.success('Profil lengkap! Selamat datang 🎉');
      navigate('/dashboard'); 
    } catch (err) {
      toast.error(err?.message || 'Gagal lengkapi profile');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex-1 flex flex-col bg-gray-100 py-12 md:py-20">
      <Container className="flex-1 flex items-center justify-center h-full">
        <div className="w-full max-w-md bg-light-blue rounded-2xl shadow-lg p-5 sm:p-8">
          <h1 className="text-2xl font-bold text-center text-primary-blue mb-2">
            Lengkapi Akun
          </h1>
          <p className="text-center text-primary-blue opacity-80 text-sm mb-6">
            Buat password untuk akun Google Anda
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-primary-blue">Email</label>
              <input
                value={email}
                disabled
                className="w-full mt-1 px-4 py-2 rounded-full bg-gray-300 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs text-primary-blue">Nama Lengkap</label>
              <input
                value={full_name}
                disabled
                className="w-full mt-1 px-4 py-2 rounded-full bg-gray-300 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* PASSWORD BARU */}
            <div>
              <label className="text-xs text-primary-blue">Password Baru</label>
              <div className="relative mt-1 flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-12 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary-blue"
                  required
                />
                <button
                  type="button" // Pastikan type="button" agar tidak memicu submit form
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-500 hover:text-primary-blue focus:outline-none"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* KONFIRMASI PASSWORD */}
            <div>
              <label className="text-xs text-primary-blue">Konfirmasi Password</label>
              <div className="relative mt-1 flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-12 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary-blue"
                  required
                />
                <button
                  type="button" // Pastikan type="button" agar tidak memicu submit form
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-gray-500 hover:text-primary-blue focus:outline-none"
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 bg-primary-blue text-white py-2 rounded-full font-semibold hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan & Login'}
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
};

export default CompleteProfilePage;