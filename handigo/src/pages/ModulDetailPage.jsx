import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Camera, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchModuleById, fetchExercises } from '../lib/api';

const ModulDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [module, setModule] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load module + exercises only (NO progress)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const [mod, exs] = await Promise.all([
          fetchModuleById(id),
          fetchExercises(id),
        ]);

        if (!cancelled) {
          setModule(mod);
          setExercises(exs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <LoadingSpinner text="Memuat modul..." />;

  if (!module) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Modul tidak ditemukan.</p>
      </div>
    );
  }

  const handleStart = () => {
    if (!user) return;
    const first = exercises[0];

    if (first) {
      navigate(`/modul/${id}/latihan`, {
        state: {
          exerciseId: first.id,
          exerciseIndex: first.sort_order,
        },
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>

        {/* BACK */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/modul')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Kembali ke Modul
          </button>
        </div>

        {/* COVER */}
        <div className="w-full h-32 sm:h-40 md:h-52 bg-light-blue rounded-2xl flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600">
            <Camera size={32} />
          </div>
        </div>

        {/* META */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600">
            {module.total_exercises} Latihan
          </span>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-blue mb-2">
          {module.title}
        </h1>

        <p className="text-gray-600 mb-8 max-w-2xl text-sm sm:text-base">
          {module.description}
        </p>

        {/* LIST LATIHAN */}
        <h2 className="text-xl sm:text-2xl font-bold text-primary-blue text-center mb-6">
          Daftar Latihan
        </h2>

        <div className="space-y-4 mb-10">
          {exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              moduleId={id}
              user={user}
            />
          ))}
        </div>

        {/* BUTTON START */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            disabled={!user}
            className="flex items-center gap-2 bg-primary-blue text-white px-6 sm:px-8 py-3 rounded-full text-sm font-semibold hover:bg-primary-hover transition disabled:opacity-50 w-full sm:w-auto justify-center"
          >
            {!user && <Lock size={16} />}
            {user ? 'Mulai Latihan' : 'Login untuk memulai'}
          </button>
        </div>

      </Container>
    </div>
  );
};

const ExerciseCard = ({ exercise, moduleId, user }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    if (!user) return;

    navigate(`/modul/${moduleId}/latihan`, {
      state: {
        exerciseId: exercise.id,
        exerciseIndex: exercise.sort_order,
      },
    });
  };

  const handleRetry = () => {
    if (!user) return;

    const ok = window.confirm(
      `Yakin ingin mengulang "${exercise.title}"?`
    );

    if (ok) {
      navigate(`/modul/${moduleId}/latihan`, {
        state: {
          exerciseId: exercise.id,
          exerciseIndex: exercise.sort_order,
        },
      });
    }
  };

  return (
    <div className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-light-blue shadow-sm hover:-translate-y-1 transition">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-blue text-white flex items-center justify-center font-bold">
          {exercise.sort_order}
        </div>

        <div>
          <p className="font-medium">
            Latihan {exercise.sort_order} — {exercise.title}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Klik untuk mulai
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex gap-2 sm:justify-end">
        {!user ? (
          <span className="text-xs text-gray-500 italic">
            Login untuk akses
          </span>
        ) : (
          <>
            <button
              onClick={handleOpen}
              className="bg-primary-blue text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-primary-hover transition"
            >
              Kerjakan
            </button>

            
          </>
        )}
      </div>
    </div>
  );
};

export default ModulDetailPage;