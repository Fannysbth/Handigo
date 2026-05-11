import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Camera, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchModuleById, fetchExercises, fetchModuleProgress } from '../lib/api';

const ModulDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [module, setModule] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load module + exercises immediately (public data)
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
    return () => { cancelled = true; };
  }, [id]);

  // Load user progress separately (after auth resolves)
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    const loadProgress = async () => {
      try {
        const prog = await fetchModuleProgress(id);
        if (!cancelled) setProgress(prog);
      } catch (err) {
        console.error(err);
      }
    };
    loadProgress();
    return () => { cancelled = true; };
  }, [id, user, authLoading]);

  if (loading) return <LoadingSpinner text="Memuat modul..." />;
  if (!module) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-500">Modul tidak ditemukan.</p>
    </div>
  );

  const completedExercises = progress?.completed_exercises || 0;
  const progressPct = progress?.progress_percentage || 0;

  const getExerciseStatus = (exerciseIndex) => {
    if (exerciseIndex <= completedExercises) return 'done';
    if (exerciseIndex === completedExercises + 1) return 'progress';
    return 'locked';
  };

  // Navigate to the next unfinished exercise (resume behavior)
  const handleContinue = () => {
    if (!user) return;
    const nextIndex = completedExercises + 1;
    const nextExercise = exercises.find(e => e.sort_order === nextIndex) || exercises[0];
    if (nextExercise) {
      navigate(`/modul/${id}/latihan`, { state: { exerciseId: nextExercise.id, exerciseIndex: nextExercise.sort_order } });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>

        {/* BACK */}
        <div className="mb-6">
          <button onClick={() => navigate('/modul')} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
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
            Modul {module.id}
          </span>
          <span className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600">
            {module.total_exercises} Latihan
          </span>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-blue mb-2">
          {module.title}
        </h1>

        <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl text-sm sm:text-base">
          {module.description}
        </p>

        {/* PROGRESS */}
        <div className="bg-light-blue rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10">
          <h3 className="font-semibold mb-3">Progres Modul</h3>

          <div className="w-full h-3 bg-gray-200 rounded-full">
            <div className="h-3 bg-primary-blue rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
          </div>

          <p className="text-xs text-gray-600 mt-2">
            {Math.round(progressPct)}% selesai — {completedExercises} dari {module.total_exercises} latihan
          </p>
        </div>

        {/* LIST LATIHAN */}
        <h2 className="text-xl sm:text-2xl font-bold text-primary-blue text-center mb-4 sm:mb-6">
          Daftar Latihan
        </h2>

        <div className="space-y-4 mb-10">
          {exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              status={getExerciseStatus(ex.sort_order)}
              moduleId={id}
              user={user}
              progress={progress}
            />
          ))}
        </div>

        {/* BUTTON */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!user}
            className="flex items-center gap-2 bg-primary-blue text-white px-6 sm:px-8 py-3 rounded-full text-sm font-semibold hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
          >
            {!user && <Lock size={16} />}
            {user ? (completedExercises > 0 ? 'Lanjutkan Latihan' : 'Mulai Latihan') : 'Login untuk memulai latihan'}
          </button>
        </div>

      </Container>

    </div>
  );
};


const ExerciseCard = ({ exercise, status, moduleId, user, progress }) => {
  const navigate = useNavigate();
  const isDone = status === "done";
  const isProgress = status === "progress";
  const isLocked = status === "locked";

  const handleAction = () => {
    if (user) {
      navigate(`/modul/${moduleId}/latihan`, {
        state: { exerciseId: exercise.id, exerciseIndex: exercise.sort_order }
      });
    }
  };

  // "Ulang" for completed exercises — ganti dengan window.confirm
  const handleRetry = async () => {
    if (!user) return;
    const ok = window.confirm(`Yakin ingin mengulang "${exercise.title}"? Skor sebelumnya akan ditambahkan sebagai percobaan baru.`);
    if (ok) {
      navigate(`/modul/${moduleId}/latihan`, {
        state: { exerciseId: exercise.id, exerciseIndex: exercise.sort_order }
      });
    }
  };

  return (
    <div
      className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition
        ${isLocked ? "bg-gray-100 opacity-80" : "bg-light-blue shadow-sm hover:-translate-y-1"}
      `}
    >
      <div className="flex items-center gap-4">
        {/* NUMBER / ICON */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0
            ${isDone ? "bg-green-500 text-white" :
              isProgress ? "bg-primary-blue text-white" :
              "bg-gray-300 text-gray-500"}
          `}
        >
          {isDone ? <Check size={18} strokeWidth={3} /> : exercise.sort_order}
        </div>

        {/* TEXT */}
        <div>
          <p className="font-medium">
            Latihan {exercise.sort_order} — {exercise.title}
          </p>

          {isDone && (
            <p className="text-xs text-gray-500 mt-1">Selesai</p>
          )}

          {isProgress && (
            <p className="text-xs text-gray-500 mt-1">Sedang berlangsung</p>
          )}

          {isLocked && (
            <p className="text-xs text-gray-400 mt-1">Belum dimulai</p>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center sm:justify-end">
        {!user ? (
          <span className="text-xs text-gray-500 italic opacity-75">
            Login untuk akses
          </span>
        ) : (
          <>
            {isDone && (
              <button onClick={handleRetry} className="bg-white border text-primary-blue border-primary-blue px-3 py-1 rounded-full text-xs font-semibold hover:bg-light-blue transition whitespace-nowrap">
                Ulang
              </button>
            )}

            {isProgress && (
              <button onClick={handleAction} className="bg-primary-blue text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition whitespace-nowrap">
                Lanjutkan
              </button>
            )}

            {isLocked && (
              <button disabled className="bg-gray-200 text-gray-400 font-medium px-4 py-2 flex items-center gap-1 rounded-full text-xs cursor-not-allowed whitespace-nowrap">
                <Lock size={12} /> Lock
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModulDetailPage;