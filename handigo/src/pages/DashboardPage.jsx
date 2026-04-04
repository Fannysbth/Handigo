import Container from '@/components/Container';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>

      {/* HEADER */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl font-bold text-primary-blue">
          Halo, Miaung!
        </h1>
        <p className="text-gray-600 mt-1">
          Selamat datang kembali. Yuk lanjutkan belajarmu hari ini.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 cursor-default">
        <StatCard title="Modul Selesai" value="3" />
        <StatCard title="Streak Hari" value="7" />
        <StatCard title="Rata-Rata Skor" value="78%" />
      </div>

      {/* LANJUTKAN BELAJAR */}
      <div className="bg-light-blue rounded-3xl p-6 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center shrink-0 text-gray-500">
            <Camera size={28} />
          </div>

          <div className="w-full">
            <h3 className="font-semibold text-gray-800">
              Modul: Alfabet Dasar (A–Z)
            </h3>

            <div className="w-full max-w-[250px] h-2 bg-gray-200 rounded-full mt-2">
              <div className="w-[35%] h-2 bg-blue-500 rounded-full"></div>
            </div>

            <p className="text-xs text-gray-600 mt-1">
              35% selesai — 2 dari 5 latihan
            </p>
          </div>
        </div>

        <button onClick={() => navigate('/modul/dasar')} className="bg-blue-500 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-blue-600 active:scale-95 transition-all w-full sm:w-auto shrink-0 md:whitespace-nowrap">
          Lanjut
        </button>
      </div>

      {/* GRAFIK */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-primary-blue text-center mb-6">
          Grafik Akurasi Mingguan
        </h2>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-end justify-between h-64 gap-2 xs:gap-4 mt-2">
            {[60, 80, 40, 50, 65, 30, 90].map((val, i) => (
              <div key={i} className="flex flex-col items-center justify-end h-full gap-2 w-full">
                <div
                  className="bg-blue-600 w-full max-w-[32px] rounded-t-md transition-all duration-500"
                  style={{ height: `${val}%` }}
                />
                <span className="text-xs text-gray-700 font-medium">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIWAYAT */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-primary-blue text-center mb-6">
          Riwayat Latihan
        </h2>

        <div className="bg-dark-gray text-white rounded-2xl overflow-x-auto shadow-md">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-black/30">
              <tr>
                <th className="py-4 px-6 text-left whitespace-nowrap">Date</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Modul</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Latihan</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Akurasi</th>
              </tr>
            </thead>

            <tbody>
              {Array(6).fill(0).map((_, i) => (
                <tr key={i} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap">1/11/2022</td>
                  <td className="py-4 px-6 whitespace-nowrap">Alfabet Dasar</td>
                  <td className="py-4 px-6 whitespace-nowrap">Huruf A,B,C</td>
                  <td className="py-4 px-6 whitespace-nowrap font-medium text-blue-400">92%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      </Container>
    </div>
  );
};

const StatCard = ({ title, value }) => {
  return (
    <div className="bg-dark-gray text-white rounded-2xl p-6 text-center shadow-md">
      <h3 className="text-2xl font-bold">{value}</h3>
      <p className="text-sm text-gray-400 mt-1">{title}</p>
    </div>
  );
};

export default DashboardPage;