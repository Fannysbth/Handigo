import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchModules } from '@/lib/api';
import toast from 'react-hot-toast';

const ModulePreview = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadModules = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchModules();
        if (!cancelled) setModules(data.slice(0, 3)); // Show only first 3
      } catch (err) {
        console.error('Failed to load modules:', err);
        if (!cancelled) {
          setError('Gagal memuat modul');
          toast.error('Gagal memuat modul');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadModules();
    return () => { cancelled = true; };
  }, []);

  const handleModuleClick = (module) => {
    // Jangan upsert progress - biarkan user mulai sendiri
    navigate(`/modul/${module.id}`, { state: { module } });
  };

  if (loading) return <LoadingSpinner text="Memuat modul..." />;
  if (error) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-red-500">{error}</p>
    </div>
  );

  return (
    <section id="modules" className="mb-16 md:mb-20">
      <Container>
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-blue mb-4">
            Modul Latihan
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Mulai belajar bahasa isyarat dengan modul-modul interaktif yang dirancang khusus untuk pemula hingga mahir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => handleModuleClick(module)}
              className="bg-light-blue rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-full h-32 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-500">
                  {module.title.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-primary-blue mb-2">
                {module.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                {module.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{module.total_exercises} Latihan</span>
                <span className="text-primary-blue font-medium">Mulai →</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/modul')}
            className="bg-primary-blue text-white px-6 py-3 rounded-full hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all font-semibold"
          >
            Lihat Semua Modul
          </button>
        </div>
      </Container>
    </section>
  );
};

export default ModulePreview;