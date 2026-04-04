import Container from '@/components/Container';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    await updateProfile({ name: form.name, email: form.email });
    setIsSubmitting(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>

        {/* BACK */}
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-6 hover:underline cursor-pointer">
          ← Kembali
        </button>

        <h2 className="text-xl font-semibold mb-6">Edit Profil</h2>

        {/* FORM */}
        <div className="flex flex-col gap-4">

          <Input
            label="Nama Lengkap"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <Input
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Kosongkan jika tidak ingin ganti"
          />

        </div>

        {/* SAVE */}
        <button 
          onClick={handleSave} 
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-3 rounded-full mt-8 hover:bg-blue-600 active:scale-95 transition-all duration-200 disabled:opacity-50 font-semibold"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>

      </Container>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <input
      {...props}
      className="w-full px-4 py-2 rounded-full bg-light-blue text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
    />
  </div>
);
export default SettingsPage;