import Container from '@/components/Container';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>

        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center text-3xl font-bold text-gray-500">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <h2 className="text-xl font-semibold">{user?.name || 'User'}</h2>
          <p className="text-sm text-gray-500">Bergabung: Baru saja</p>
        </div>

        {/* INFO */}
        <div className="bg-light-blue rounded-3xl p-5 mb-6">
          <InfoItem label="Nama Lengkap" value={user?.name || '-'} />
          <InfoItem label="Email" value={user?.email || '-'} />
        </div>

        {/* BUTTON */}
        <button 
          className="w-full bg-light-blue text-primary-blue py-3 rounded-full hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all duration-200 font-semibold mb-4" 
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
