import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Search } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { fetchModules, fetchAllProgress } from '../lib/api';
import toast from 'react-hot-toast';

const ModuleListPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [modules, setModules] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');

  // Fetch modules immediately (public page)
  useEffect(() => {
    let cancelled = false;
    const loadModules = async () => {
      try {
        setLoading(true);
        setError(null);
        const mods = await fetchModules();
        if (!cancelled) setModules(mods);
      } catch (err) {
        console.error('Failed to load modules:', err);
        if (!cancelled) {
          setError('Gagal memuat modul.');
          toast.error('Gagal memuat modul');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadModules();
    return () => { cancelled = true; };
  }, []);

  // Fetch user progress separately (hanya jika user login)
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    const loadProgress = async () => {
      try {
        const progress = await fetchAllProgress(); // TIDAK ada parameter user.id
        if (!cancelled) {
          const map = {};
          progress.forEach(p => { map[p.module_id] = p; });
          setProgressMap(map);
        }
      } catch (err) {
        console.error('Failed to load progress:', err);
        // Jangan set error jika unauthorized (user belum login)
        if (err.message !== 'Unauthorized' && !cancelled) {
          toast.error('Gagal memuat progress');
        }
      }
    };
    loadProgress();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  // Combined filtering: hanya search (tidak ada level di backend)
  const filteredModules = useMemo(() => {
    const q = search.toLowerCase().trim();
    return modules.filter((mod) => {
      const matchSearch = !q ||
        mod.title.toLowerCase().includes(q) ||
        (mod.description || '').toLowerCase().includes(q);
      return matchSearch;
    });
  }, [modules, search]);

  // Determine if a module is locked (simplified - tidak ada prerequisites di backend)
  const isModuleLocked = (mod) => {
    // Untuk sekarang, semua modul unlocked jika user login
    // Bisa ditambah logic nanti jika ada prerequisites
    return false;
  };

  if (loading) return <LoadingSpinner text="Memuat modul..." />;
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

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>

        {/* BACK / BREADCRUMB */}
        <div className="mb-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ← Kembali ke Beranda
          </button>
        </div>

        {/* SEARCH */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">
          <div className="w-full lg:w-[300px] relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari modul..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue transition-shadow"
            />
          </div>
        </div>

        {/* RESULT COUNT */}
        {search && (
          <p className="text-sm text-gray-500 mb-4">
            Menampilkan {filteredModules.length} dari {modules.length} modul
            {search && <span className="font-medium"> — "{search}"</span>}
          </p>
        )}

        {/* GRID */}
        {filteredModules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredModules.map((mod) => (
              <ModuleCard
                key={mod.id}
                user={user}
                module={mod}
                progress={progressMap[mod.id]}
                locked={isModuleLocked(mod)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Tidak ada modul ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">Coba ubah kata kunci pencarian</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 text-sm text-primary-blue hover:underline font-medium"
              >
                Reset pencarian
              </button>
            )}
          </div>
        )}

      </Container>
    </div>
  );
};

const ModuleCard = ({ module, progress, locked, user }) => {
  const navigate = useNavigate();
  const { id, title, description, total_exercises } = module;

  const completedExercises = progress?.completed_exercises || 0;
  const progressPct = progress?.progress_percentage || 0;

  const isAuthLocked = !user;
  const globallyLocked = isAuthLocked || locked;

  return (
    <div className={`rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 ${globallyLocked ? 'bg-gray-100' : 'bg-light-blue shadow-sm hover:shadow-md'}`}>

      {globallyLocked && (
        <div className="absolute inset-0 bg-white/40 z-10 pointer-events-none"></div>
      )}

      {/* IMAGE PLACEHOLDER */}
      <div className={`w-full h-32 bg-gray-200 rounded-2xl relative overflow-hidden ${globallyLocked ? 'grayscale opacity-70' : ''}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-400">
            {title.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-xs py-1 text-center font-medium">
          Modul {id}
        </div>
      </div>

      {/* TITLE */}
      <div className={globallyLocked ? 'opacity-80' : ''}>
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-gray-800 leading-snug">
            {title}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {total_exercises} latihan
          </span>
        </div>

        <p className="text-xs text-gray-600 mt-1">
          {description}
        </p>
      </div>

      {/* PROGRESS */}
      <div className={globallyLocked ? 'opacity-50' : ''}>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-primary-blue rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className="text-[10px] text-gray-500 mt-1 font-medium">
          {Math.round(progressPct)}% selesai — {completedExercises}/{total_exercises} latihan
        </p>
      </div>

      {/* BUTTON CONSTRAINTS */}
      <div className="z-20 mt-auto pt-2">
        {isAuthLocked ? (
          <button 
            disabled 
            className="w-full bg-gray-200 text-gray-600 text-sm py-2 rounded-full flex items-center justify-center gap-2 opacity-80 cursor-not-allowed font-medium"
          >
            <Lock size={14} /> Login untuk membuka
          </button>
        ) : locked ? (
          <button 
            disabled 
            className="w-full bg-gray-200 text-gray-600 text-sm py-2 px-2 rounded-full flex items-center justify-center gap-2 opacity-80 cursor-not-allowed font-medium"
          >
            <Lock size={14} /> Modul terkunci
          </button>
        ) : (
          <button 
            onClick={() => navigate(`/modul/${id}`)} 
            className="w-full bg-primary-blue text-white text-sm py-2 rounded-full hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm font-semibold"
          >
            {progressPct > 0 ? "Lanjutkan" : "Mulai"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ModuleListPage;