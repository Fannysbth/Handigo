import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchProfile, logoutUser } from '../lib/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const p = await fetchProfile(); // TIDAK ada parameter user.id
        if (!cancelled) setProfile(p);
      } catch (err) {
        console.error('Failed to load profile:', err);
        if (!cancelled) {
          setError('Gagal memuat profil');
          toast.error('Gagal memuat profil');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  const handleLogout = async () => {
    const confirmed = window.confirm('Yakin ingin keluar? Kamu perlu login kembali untuk melanjutkan belajar.');
    if (!confirmed) return;
    
    try {
      await logoutUser(); // Gunakan api.js
      await logout(); // Logout dari AuthContext juga
      navigate('/login');
      toast.success('Berhasil keluar');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Gagal keluar');
    }
  };

  if (authLoading || loading) return <LoadingSpinner text="Memuat profil..." />;
  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <p className="text-red-500">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-primary-blue text-white px-4 py-2 rounded-full text-sm"
      >
        Coba Lagi
      </button>
    </div>
  );

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Baru saja';

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>

        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center text-3xl font-bold text-gray-500">
            {user?.full_name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <h2 className="text-xl font-semibold">{user?.full_name || user?.name || 'User'}</h2>
          <p className="text-sm text-gray-500">Bergabung: {joinDate}</p>
        </div>

        {/* INFO */}
        <div className="bg-light-blue rounded-3xl p-5 mb-6">
          <InfoItem label="Nama Lengkap" value={user?.full_name || user?.name || '-'} />
          <InfoItem label="Email" value={user?.email || '-'} />
          <InfoItem label="Avatar URL" value={profile?.avatar_url || '-'} />
        </div>

        {/* BUTTON */}
        <button
          className="w-full bg-primary-blue text-white py-3 rounded-full hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all duration-200 font-semibold mb-4"
          onClick={() => navigate('/settings')}
        >
          Edit Profil
        </button>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-full hover:scale-105 active:scale-95 transition-transform duration-200 font-semibold border border-red-100"
        >
          <LogOut size={16} />
          Keluar
        </button>

      </Container>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="mb-4 last:mb-0">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <div className="bg-white rounded-xl px-4 py-2 text-sm text-gray-700">
      {value}
    </div>
  </div>
);

export default ProfilePage;
