import Container from '@/components/Container';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

const modules = [
  {
    id: 'alfabet',
    title: "Alfabet Dasar (A–Z)",
    level: "Dasar",
    duration: "±10 menit",
    desc: "Pelajari 26 huruf alfabet dalam bahasa isyarat Indonesia",
    progress: 35,
    total: 5,
    done: 2,
    locked: false,
  },
  {
    id: 'angka',
    title: "Angka 1–10",
    level: "Dasar",
    duration: "±8 menit",
    desc: "Pelajari isyarat untuk angka 1 sampai 10",
    progress: 0,
    total: 5,
    done: 0,
    locked: false,
  },
  {
    id: 'sapaan',
    title: "Sapaan & Perkenalan",
    level: "Menengah",
    duration: "±15 menit",
    desc: "Pelajari berbagai isyarat untuk menyapa dan memperkenalkan diri",
    progress: 0,
    total: 6,
    done: 0,
    locked: true,
  },
  {
    id: 'kalimat',
    title: "Kalimat Sehari-hari",
    level: "Lanjutan",
    duration: "±20 menit",
    desc: "Pelajari berbagai kalimat yang sering digunakan sehari-hari",
    progress: 0,
    total: 6,
    done: 0,
    locked: true,
  },
];

const ModuleListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>

        {/* BACK / BREADCRUMB */}
        <div className="mb-4">
          <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
            ← Kembali ke Beranda
          </button>
        </div>

        {/* FILTER + SEARCH */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">

          {/* FILTER */}
          <div className="flex flex-wrap gap-3">
            <FilterButton active>Semua</FilterButton>
            <FilterButton>Dasar</FilterButton>
            <FilterButton>Menengah</FilterButton>
            <FilterButton>Lanjutan</FilterButton>
          </div>

          {/* SEARCH */}
          <div className="w-full lg:w-[300px]">
            <input
              type="text"
              placeholder="Cari modul..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {modules.map((mod, i) => (
            <ModuleCard key={i} user={user} {...mod} />
          ))}

        </div>

      </Container>
    </div>
  );
};


const FilterButton = ({ children, active }) => {
  return (
    <button
      className={`px-4 py-2 rounded-full text-sm border transition
        ${active
          ? "bg-primary-blue text-white border-primary-blue"
          : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }
      `}
    >
      {children}
    </button>
  );
};


const ModuleCard = ({
  id,
  title,
  level,
  duration,
  desc,
  progress,
  total,
  done,
  locked, // Internal logic lock
  user,
}) => {
  const navigate = useNavigate();
  // Dual-lock rendering schema explicitly
  const isAuthLocked = !user; 
  const isProgressionLocked = user && locked;
  const globallyLocked = isAuthLocked || isProgressionLocked;

  return (
    <div className={`rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 ${globallyLocked ? 'bg-gray-100' : 'bg-light-blue shadow-sm hover:shadow-md'}`}>

      {globallyLocked && (
        <div className="absolute inset-0 bg-white/40 z-10 pointer-events-none"></div>
      )}

      {/* IMAGE */}
      <div className={`w-full h-32 bg-gray-200 rounded-2xl relative overflow-hidden ${globallyLocked ? 'grayscale opacity-70' : ''}`}>
        <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-xs py-1 text-center font-medium">
          {level}
        </div>
      </div>

      {/* TITLE */}
      <div className={globallyLocked ? 'opacity-80' : ''}>
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-gray-800 leading-snug">
            {title}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {duration}
          </span>
        </div>

        <p className="text-xs text-gray-600 mt-1">
          {desc}
        </p>
      </div>

      {/* PROGRESS */}
      <div className={globallyLocked ? 'opacity-50' : ''}>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[10px] text-gray-500 mt-1 font-medium">
          {progress}% selesai — {done}/{total} latihan
        </p>
      </div>

      {/* BUTTON CONSTRAINTS */}
      <div className="z-20 mt-auto pt-2">
        {isAuthLocked ? (
          <button disabled className="w-full bg-gray-200 text-gray-600 text-sm py-2 rounded-full flex items-center justify-center gap-2 opacity-80 cursor-not-allowed font-medium">
            <Lock size={14} /> Login untuk membuka
          </button>
        ) : isProgressionLocked ? (
          <button disabled className="w-full bg-gray-200 text-gray-600 text-sm py-2 px-2 rounded-full flex items-center justify-center gap-2 opacity-80 cursor-not-allowed font-medium">
            <Lock size={14} /> Selesaikan modul dasar
          </button>
        ) : (
          <button onClick={() => navigate(`/modul/${id}`)} className="w-full bg-blue-500 text-white text-sm py-2 rounded-full hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm font-semibold">
            {progress > 0 ? "Lanjutkan" : "Mulai"}
          </button>
        )}
      </div>

    </div>
  );
};

export default ModuleListPage;