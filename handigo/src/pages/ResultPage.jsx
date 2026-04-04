import Container from '@/components/Container';
import { useNavigate, useParams } from 'react-router-dom';

const ResultPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const score = 85;
  const attempts = 5;
  const time = 90;

  const details = [
    { label: 'Huruf G', value: 90 },
    { label: 'Huruf H', value: 75 },
    { label: 'Huruf I', value: 85 },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>

        {/* BACK */}
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-6 hover:underline cursor-pointer">
          ← Kembali
        </button>

        {/* SCORE CIRCLE */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-40 h-40 rounded-full bg-light-blue flex items-center justify-center">
            <span className="text-4xl font-bold text-primary-blue">
              {score}%
            </span>
          </div>

          <h2 className="text-xl font-semibold mt-6">
            Latihan 3 Selesai!
          </h2>

          <p className="text-sm text-gray-500 mt-2 max-w-md">
            Gerakan untuk huruf H perlu sedikit perbaikan. Pastikan jari tengah sejajar dengan jari telunjuk.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Percobaan" value={attempts} />
          <StatCard label="Skor Terbaik" value={`${score}%`} />
          <StatCard label="Waktu" value={`${time}s`} />
        </div>

        {/* DETAIL */}
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
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate(`/modul/${id || 'dasar'}/latihan`)} className="bg-blue-500 text-white text-sm px-6 py-2 rounded-full hover:bg-blue-600 active:scale-95 transition-all font-semibold">
            Coba Lagi
          </button>

          <button onClick={() => navigate('/modul')} className="bg-white text-blue-500 border border-blue-500 text-sm px-6 py-2 rounded-full hover:bg-blue-50 active:scale-95 transition-all font-semibold">
            Latihan Berikutnya
          </button>
        </div>

      </Container>
    </div>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <div className="bg-black text-white rounded-2xl py-4 flex flex-col items-center justify-center">
      <span className="text-xl font-semibold">{value}</span>
      <span className="text-xs opacity-80 mt-1">{label}</span>
    </div>
  );
};

export default ResultPage;
