import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Container from '@/components/Container';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const CompleteProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, full_name } = location.state || {};

  const { completeProfile } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !full_name) {
      toast.error('Data login Google tidak lengkap. Silakan coba login ulang.');
      navigate('/login');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeProfile(email, password, full_name);
      // BE complete-profile belum meng-issue cookie login, jadi FE kita tetap arahkan login.
      toast.success('Profil lengkap! Silakan login.');
      navigate('/login');
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
                value={email || ''}
                disabled
                className="w-full mt-1 px-4 py-2 rounded-full bg-gray-100"
              />
            </div>

            <div>
              <label className="text-xs text-primary-blue">Nama Lengkap</label>
              <input
                value={full_name || ''}
                disabled
                className="w-full mt-1 px-4 py-2 rounded-full bg-gray-100"
              />
            </div>

            <div>
              <label className="text-xs text-primary-blue">Password Baru</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary-blue"
                required
              />
            </div>

            <div>
              <label className="text-xs text-primary-blue">Konfirmasi Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary-blue"
                required
              />
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

