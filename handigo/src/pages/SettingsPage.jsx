import Container from '@/components/Container';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProfile } from '../lib/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ LOAD DATA DARI DATABASE (bukan hanya auth context)
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        setLoading(true);

        const profile = await fetchProfile();

        setForm({
          full_name: profile?.full_name || '',
          email: profile?.email || '',
          password: '',
        });
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }

    try {
      setIsSubmitting(true);

      await updateProfile({
        full_name: form.full_name,
        password: form.password || undefined,
      });

      toast.success('Profil berhasil diperbarui');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan perubahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Memuat profile...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-10">
      <Container>

        {/* BACK BUTTON (TOP LEFT) */}
        <div className="flex items-center  pt-10">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:underline"
          >
            ← Kembali
          </button>
        </div>

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <p className="text-sm text-gray-500">
            Ubah data akun kamu
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-light-blue rounded-3xl p-5 mb-6">

          {/* NAMA */}
          <Input
            label="Nama Lengkap"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
          />

          {/* EMAIL (LOCKED) */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <input
              value={form.email}
              disabled
              className="w-full bg-gray-100 rounded-xl px-4 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Email tidak dapat diubah
            </p>
          </div>

          {/* PASSWORD */}
          <Input
            label="Password Baru"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Kosongkan jika tidak ingin mengganti"
          />

        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full bg-primary-blue text-white py-3 rounded-full hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all duration-200 font-semibold disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>

      </Container>
    </div>
  );
};

/* INPUT COMPONENT */
const Input = ({ label, ...props }) => (
  <div className="mb-4">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <input
      {...props}
      className="w-full bg-white rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-blue"
    />
  </div>
);

export default SettingsPage;