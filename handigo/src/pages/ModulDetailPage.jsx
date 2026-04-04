import Container from '@/components/Container';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Camera, Check } from 'lucide-react';

const ModulDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>

        {/* BACK */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
            ← Kembali
          </button>
        </div>

        {/* COVER */}
        <div className="w-full h-40 md:h-52 bg-light-blue rounded-2xl flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600">
            <Camera size={32} />
          </div>
        </div>

        {/* META */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600">
            Dasar
          </span>
          <span className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600">
            5 Latihan
          </span>
          <span className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600">
            ±10 menit
          </span>
        </div>

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-primary-blue mb-2">
          Alfabet Dasar (A–Z)
        </h1>

        <p className="text-gray-600 mb-8 max-w-2xl">
          Modul ini mengajarkan 26 huruf alfabet dalam Bisindo (Bahasa Isyarat Indonesia).
          Cocok untuk pemula yang baru memulai belajar bahasa isyarat.
        </p>

        {/* PROGRESS */}
        <div className="bg-light-blue rounded-2xl p-6 mb-10">
          <h3 className="font-semibold mb-3">Progres Modul</h3>

          <div className="w-full h-3 bg-gray-200 rounded-full">
            <div className="w-[35%] h-3 bg-blue-500 rounded-full"></div>
          </div>

          <p className="text-xs text-gray-600 mt-2">
            35% selesai — 2 dari 5 latihan
          </p>
        </div>

        {/* LIST LATIHAN */}
        <h2 className="text-2xl font-bold text-primary-blue text-center mb-6">
          Daftar Latihan
        </h2>

        <div className="space-y-4 mb-10">

          {/* DONE */}
          <ExerciseCard
            index={1}
            title="Huruf A, B, C"
            status="done"
            score="90/100"
            moduleId={id}
            user={user}
          />

          {/* ONGOING */}
          <ExerciseCard
            index={2}
            title="Huruf D, E, F"
            status="progress"
            moduleId={id}
            user={user}
          />

          {/* LOCKED */}
          <ExerciseCard
            index={3}
            title="Huruf G, H, I"
            status="locked"
            moduleId={id}
            user={user}
          />

          <ExerciseCard
            index={4}
            title="Huruf J, K, L"
            status="locked"
            moduleId={id}
            user={user}
          />

        </div>

        {/* BUTTON */}
        <div className="flex justify-center">
          <button 
            onClick={() => user && navigate(`/modul/${id || 'dasar'}/latihan`)} 
            disabled={!user}
            className="flex items-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!user && <Lock size={16} />}
            {user ? 'Lanjutkan Latihan' : 'Login untuk memulai latihan'}
          </button>
        </div>

      </Container>
    </div>
  );
};


const ExerciseCard = ({ index, title, status, score, moduleId, user }) => {
  const navigate = useNavigate();
  const isDone = status === "done";
  const isProgress = status === "progress";
  const isLocked = status === "locked";

  const handleAction = () => {
    if (user) {
      navigate(`/modul/${moduleId || 'dasar'}/latihan`);
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
          {isDone ? <Check size={18} strokeWidth={3} /> : index}
        </div>

        {/* TEXT */}
        <div>
          <p className="font-medium">
            Latihan {index} — {title}
          </p>

          {isDone && (
            <p className="text-xs text-gray-500 mt-1">100% Selesai</p>
          )}

          {isProgress && (
            <p className="text-xs text-gray-500 mt-1">35% Selesai</p>
          )}

          {isLocked && (
            <p className="text-xs text-gray-400 mt-1">Belum dimulai</p>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center sm:justify-end">
        {!user && !isLocked ? (
          <span className="text-xs text-gray-500 italic opacity-75">
            Login untuk akses
          </span>
        ) : (
          <>
            {isDone && (
              <span className="text-sm font-medium text-gray-600 flex items-center gap-3">
                <span className="hidden xs:inline">Skor {score}</span>
                <button onClick={handleAction} disabled={!user} className="bg-white border text-blue-500 border-blue-500 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-50 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                  Ulang
                </button>
              </span>
            )}

            {isProgress && (
              <button onClick={handleAction} disabled={!user} className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
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