import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';
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

  // LOAD MODULES (PUBLIC)
  useEffect(() => {
    let cancelled = false;

    const loadModules = async () => {
      try {
        setLoading(true);
        setError(null);

        const mods = await fetchModules();

        if (!cancelled) setModules(mods);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Gagal memuat modul.');
          toast.error('Gagal memuat modul');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadModules();

    return () => {
      cancelled = true;
    };
  }, []);

  // LOAD PROGRESS (OPTIONAL - ONLY IF LOGIN)
  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    const loadProgress = async () => {
      try {
        const progress = await fetchAllProgress();

        if (!cancelled) {
          const map = {};
          progress.forEach(p => {
            map[p.module_id] = p;
          });
          setProgressMap(map);
        }
      } catch (err) {
        console.error(err);
        if (err.message !== 'Unauthorized' && !cancelled) {
          toast.error('Gagal memuat progress');
        }
      }
    };

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const filteredModules = useMemo(() => {
    const q = search.toLowerCase().trim();

    return modules.filter(mod => {
      return (
        !q ||
        mod.title.toLowerCase().includes(q) ||
        (mod.description || '').toLowerCase().includes(q)
      );
    });
  }, [modules, search]);

  if (loading) return <LoadingSpinner text="Memuat modul..." />;

  if (error) {
    return (
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
  }

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>

        {/* BACK */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Kembali ke Beranda
          </button>
        </div>

        {/* SEARCH */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">
          <div className="w-full lg:w-[300px] relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari modul..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredModules.map(mod => (
            <ModuleCard
              key={mod.id}
              module={mod}
              progress={progressMap[mod.id]}
              user={user}
            />
          ))}
        </div>

      </Container>
    </div>
  );
};

const ModuleCard = ({ module, progress, user }) => {
  const navigate = useNavigate();

  const { id, title, description, total_exercises } = module;

  const completedExercises = progress?.completed_exercises || 0;
  const progressPct = progress?.progress_percentage || 0;

  return (
    <div className="rounded-3xl p-5 flex flex-col gap-4 bg-light-blue shadow-sm hover:shadow-md transition">

      {/* IMAGE */}
      <div className="w-full h-32 bg-gray-200 rounded-2xl relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-400">
            {title.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="absolute bottom-0 w-full text-center bg-black text-white text-xs py-1">
          Modul {id}
        </div>
      </div>

      {/* TITLE */}
      <div>
        <div className="flex justify-between">
          <h3 className="font-semibold">{title}</h3>
          <span className="text-xs text-gray-500">
            {total_exercises} latihan
          </span>
        </div>

        <p className="text-xs text-gray-600 mt-1">
          {description}
        </p>
      </div>

      {/* PROGRESS (ONLY VISUAL) */}
      <div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-primary-blue rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className="text-[10px] text-gray-500 mt-1">
          {Math.round(progressPct)}% — {completedExercises}/{total_exercises}
        </p>
      </div>

      {/* BUTTON (NO LOCK ANYMORE) */}
      <button
        onClick={() => navigate(`/modul/${id}`)}
        className="w-full bg-primary-blue text-white text-sm py-2 rounded-full hover:bg-primary-hover transition"
      >
        {progressPct > 0 ? "Lanjutkan" : "Mulai"}
      </button>
    </div>
  );
};

export default ModuleListPage;