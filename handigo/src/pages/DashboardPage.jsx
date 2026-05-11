import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  fetchAllProgress,
  fetchLastAccessedModule,
  fetchUserResults,
} from '../lib/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState(null);
  const [lastModule, setLastModule] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for auth to resolve first
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch last accessed module & all progress
        const [lm, allProgress, rr] = await Promise.all([
          fetchLastAccessedModule(),
          fetchAllProgress(),
          fetchUserResults(10),
        ]);

        if (cancelled) return;

        setLastModule(lm);
        setRecentResults(rr);

        // Calculate stats from progress data
        const completedModules = allProgress?.filter(
          (p) => p.progress_percentage === 100
        ).length || 0;

        const avgAccuracy =
          rr.length > 0
            ? Math.round(rr.reduce((sum, r) => sum + r.accuracy, 0) / rr.length)
            : 0;

        // Generate week data (last 7 days)
        const weekData = generateWeekData(rr);

        setStats({
          completedModules,
          streak: 0, // Bisa diimplementasikan dari backend nanti
          avgAccuracy,
          weekData,
          totalResults: rr.length,
        });
      } catch (err) {
        console.error('Dashboard load error:', err);
        if (!cancelled) setError('Gagal memuat dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const generateWeekData = (results) => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayResults = results.filter((r) =>
        r.created_at.startsWith(dateStr)
      );

      const accuracy =
        dayResults.length > 0
          ? Math.round(
              dayResults.reduce((sum, r) => sum + r.accuracy, 0) /
                dayResults.length
            )
          : 0;

      weekData.push({
        day: days[date.getDay()],
        accuracy: accuracy || 5, // Min 5% untuk visibility
      });
    }

    return weekData;
  };

  if (authLoading || loading)
    return <LoadingSpinner text="Memuat dashboard..." />;

  if (error)
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

  const moduleName = lastModule?.modules?.title || 'Belum ada modul aktif';
  const moduleId = lastModule?.module_id;
  const progressPct = lastModule?.progress_percentage || 0;
  const completedEx = lastModule?.completed_exercises || 0;
  const totalEx = lastModule?.modules?.total_exercises || 0;

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>
        {/* HEADER */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-blue">
            Halo, {user?.full_name || user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Selamat datang kembali. Yuk lanjutkan belajarmu hari ini.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-10 cursor-default">
          <StatCard
            title="Modul Selesai"
            value={stats?.completedModules || 0}
          />
          <StatCard title="Streak Hari" value={stats?.streak || 0} />
          <StatCard title="Rata-Rata Skor" value={`${stats?.avgAccuracy || 0}%`} />
        </div>

        {/* LANJUTKAN BELAJAR */}
        <div className="bg-light-blue rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-8 sm:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center shrink-0 text-gray-500">
              <Camera size={28} />
            </div>

            <div className="w-full">
              <h3 className="font-semibold text-gray-800">
                {lastModule
                  ? `Modul: ${moduleName}`
                  : 'Belum ada modul aktif'}
              </h3>

              {lastModule && (
                <>
                  <div className="w-full sm:max-w-[250px] h-2 bg-gray-200 rounded-full mt-2">
                    <div
                      className="h-2 bg-primary-blue rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-gray-600 mt-1">
                    {Math.round(progressPct)}% selesai — {completedEx} dari{' '}
                    {totalEx} latihan
                  </p>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() =>
              navigate(moduleId ? `/modul/${moduleId}` : '/modul')
            }
            className="bg-primary-blue text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary-hover active:scale-95 transition-all w-full sm:w-auto shrink-0 md:whitespace-nowrap"
          >
            {lastModule ? 'Lanjut' : 'Pilih Modul'}
          </button>
        </div>

        {/* GRAFIK */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-primary-blue text-center mb-4 sm:mb-6">
            Grafik Akurasi Mingguan
          </h2>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-end justify-between h-48 sm:h-64 gap-1 sm:gap-4 mt-2">
              {(stats?.weekData || []).map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-end h-full gap-2 w-full"
                >
                  <div
                    className="bg-primary-blue w-full max-w-[32px] rounded-t-md transition-all duration-500"
                    style={{ height: `${item.accuracy}%` }}
                  />
                  <span className="text-xs text-gray-700 font-medium">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>

            {stats?.totalResults === 0 && (
              <p className="text-center text-sm text-gray-400 mt-4">
                Belum ada data. Mulai latihan untuk melihat grafik.
              </p>
            )}
          </div>
        </div>

        {/* RIWAYAT */}
        <div className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-primary-blue text-center mb-4 sm:mb-6">
            Riwayat Latihan
          </h2>

          {recentResults.length === 0 ? (
            <p className="text-center text-sm text-gray-400">
              Belum ada riwayat latihan.
            </p>
          ) : (
            <div className="bg-dark-gray text-white rounded-2xl overflow-x-auto shadow-md">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-black/30">
                  <tr>
                    <th className="py-4 px-6 text-left whitespace-nowrap">
                      Tanggal
                    </th>
                    <th className="py-4 px-6 text-left whitespace-nowrap">
                      Modul
                    </th>
                    <th className="py-4 px-6 text-left whitespace-nowrap">
                      Latihan
                    </th>
                    <th className="py-4 px-6 text-left whitespace-nowrap">
                      Akurasi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentResults.map((result) => (
                    <tr
                      key={result.id}
                      className="border-t border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        {new Date(result.created_at).toLocaleDateString(
                          'id-ID'
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {result.modules?.title || '-'}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {result.exercises?.title || '-'}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap font-medium text-white/90">
                        {result.accuracy}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

const StatCard = ({ title, value }) => {
  return (
    <div className="bg-dark-gray text-white rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center shadow-md">
      <h3 className="text-lg sm:text-2xl font-bold">{value}</h3>
      <p className="text-[10px] sm:text-sm text-gray-400 mt-1">{title}</p>
    </div>
  );
};

export default DashboardPage;