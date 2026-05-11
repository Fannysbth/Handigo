import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchLatestResult } from '../lib/api';
import toast from 'react-hot-toast';

const ResultPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state) return;

    let cancelled = false;
    const loadLatest = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLatestResult();

        if (!cancelled) {
          setResult({
            score: data.score,
            accuracy: data.accuracy,
            timeSeconds: data.time_seconds,
            exerciseTitle: data.exercises?.title || 'Latihan',
            exerciseIndex: 1, // Default jika tidak ada
            totalExercises: 1, // Default jika tidak ada
          });
        }
      } catch (err) {
        console.error('Failed to load latest result:', err);
        if (!cancelled) {
          setError('Gagal memuat hasil latihan');
          toast.error('Gagal memuat hasil latihan');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadLatest();
    return () => { cancelled = true; };
  }, [location.state]);

  // Get result data from navigation state (passed from LatihanPage)
  const {
    score = 0,
    accuracy = 0,
    timeSeconds = 0,
    exerciseTitle = 'Latihan',
    exerciseIndex = 1,
    totalExercises = 1,
  } = result || {};

  const isLastExercise = exerciseIndex >= totalExercises;

  // Generate per-gesture detail breakdown (simplified - hapus simulasi random)
  // Jika backend punya data detail, ganti dengan data real
  const details = [
    { label: 'Posisi Tangan', value: accuracy },
    { label: 'Gerakan Utama', value: Math.max(0, accuracy - 5) },
    { label: 'Konsistensi', value: Math.min(100, accuracy + 10) },
  ];

  if (loading) {
    return <LoadingSpinner text="Memuat hasil..." />;
  }

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
        <button onClick={() => navigate(`/modul/${id}`)} className="text-sm text-gray-500 mb-6 hover:underline cursor-pointer">
          ← Kembali ke Modul
        </button>

        {/* SCORE CIRCLE */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-light-blue flex items-center justify-center">
            <span className="text-3xl sm:text-4xl font-bold text-primary-blue">
              {score}%
            </span>
          </div>

          <h2 className="text-xl font-semibold mt-6">
            Latihan {exerciseIndex} Selesai!
          </h2>

          <p className="text-sm text-gray-500 mt-2 max-w-md">
            {score >= 80
              ? 'Bagus sekali! Kamu sudah menguasai gerakan ini dengan baik.'
              : score >= 60
              ? 'Cukup bagus! Terus berlatih untuk meningkatkan akurasi.'
              : 'Perlu latihan lebih. Coba perhatikan referensi gerakan dan ulangi.'}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          <StatCard label="Akurasi" value={`${accuracy}%`} />
          <StatCard label="Skor" value={`${score}`} />
          <StatCard label="Waktu" value={`${timeSeconds}s`} />
        </div>

        {/* DETAIL */}
        {details.length > 0 && (
          <div className="bg-light-blue rounded-3xl p-5 mb-8">
            <h3 className="text-xl font-semibold text-center mb-4">
              Detail Per Gerakan
            </h3>

            <div className="flex flex-col gap-4">
              {details.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="text-gray-500">{item.value}%</span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-primary-blue rounded-full transition-all duration-500"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => navigate(`/modul/${id}/latihan`, {
              state: { exerciseIndex }
            })}
            className="bg-primary-blue text-white text-sm px-6 py-3 rounded-full hover:bg-primary-hover active:scale-95 transition-all font-semibold w-full sm:w-auto"
          >
            Coba Lagi
          </button>

          <button
            onClick={() => {
              if (isLastExercise) {
                navigate(`/modul/${id}`);
              } else {
                navigate(`/modul/${id}/latihan`, {
                  state: { exerciseIndex: exerciseIndex + 1 }
                });
              }
            }}
            className="bg-white text-primary-blue border border-primary-blue text-sm px-6 py-3 rounded-full hover:bg-light-blue active:scale-95 transition-all font-semibold w-full sm:w-auto"
          >
            {isLastExercise ? 'Kembali ke Modul' : 'Latihan Berikutnya'}
          </button>
        </div>

      </Container>
    </div>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <div className="bg-black text-white rounded-xl sm:rounded-2xl py-3 sm:py-4 flex flex-col items-center justify-center">
      <span className="text-base sm:text-xl font-semibold">{value}</span>
      <span className="text-[10px] sm:text-xs opacity-80 mt-1">{label}</span>
    </div>
  );
};

export default ResultPage;
