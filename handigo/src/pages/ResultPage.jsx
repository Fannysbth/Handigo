import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { fetchLatestResultAndNextExercises } from '../lib/api';

const ResultPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // kiri (latest)
  const [latest, setLatest] = useState(null);

  // kanan (nextExercises)
  const [nextExercises, setNextExercises] = useState([]);

  useEffect(() => {
  let cancelled = false;

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const resp = await fetchLatestResultAndNextExercises();

      if (cancelled) return;

      setLatest(resp?.latest || null);
      setNextExercises(resp?.nextExercises || []);
    } catch (err) {
      console.error(err);
      if (!cancelled) {
        setError('Gagal memuat hasil latihan');
        toast.error('Gagal memuat hasil latihan');
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  load();
  return () => {
    cancelled = true;
  };
}, []);

  if (loading) return <LoadingSpinner text="Memuat hasil..." />;

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!latest) return null;
  const moduleId = latest.module_id;

  // Backend: latest.exercises contains title + sort_order
  const exerciseIndex = latest.exercises?.sort_order || 1;
  const timeSeconds = latest.time_seconds ?? 0;

  const handleRetry = () => {
  const exerciseId = latest.exercises?.id ?? latest.exercise_id;

  if (!exerciseId) {
    navigate(-1);
    return;
  }

  const moduleId = latest.module_id;

  navigate(`/modul/${moduleId}/latihan`, {
    state: {
      exerciseId,
      exerciseIndex,
    },
  });
};

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>
        <button
          onClick={() => navigate(`/modul/${moduleId}`)}
          className="text-sm text-gray-500 mb-6 hover:underline"
        >
          ← Kembali ke Modul
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: result only */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-light-blue rounded-2xl p-5">
              <h2 className="text-lg font-bold text-primary-blue">Latihan Selesai</h2>
              <p className="text-sm text-gray-600 mt-2">Latihan ke-{exerciseIndex}</p>
              <p className="text-sm text-gray-600">Durasi: {timeSeconds}s</p>
            </div>

            <button
              onClick={handleRetry}
              className="w-full bg-primary-blue text-white py-3 rounded-full text-sm font-semibold hover:bg-primary-hover"
            >
              Coba Lagi
            </button>

            <button
              onClick={() => navigate(`/modul/${moduleId}`)}
              className="w-full border border-primary-blue text-primary-blue py-3 rounded-full text-sm font-semibold hover:bg-light-blue"
            >
              Kembali ke Modul
            </button>
          </div>

          {/* RIGHT: nextExercises only */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-primary-blue mb-4">Latihan Lainnya</h3>

            {nextExercises.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada latihan berikutnya</p>
            ) : (
              <div className="space-y-3">
                {nextExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() =>
                      navigate(`/modul/${moduleId}/latihan`, {
                        state: {
                          exerciseId: ex.id,
                          exerciseIndex: ex.sort_order,
                        },
                      })
                    }
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-light-blue hover:bg-blue-100 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-primary-blue">
                        {ex.sort_order}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Latihan {ex.sort_order}</p>
                        <p className="text-xs text-gray-500">{ex.title}</p>
                      </div>
                    </div>
                    <span className="bg-primary-blue text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-primary-hover transition">Kerjakan</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ResultPage;

