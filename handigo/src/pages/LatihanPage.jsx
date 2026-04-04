import Container from '@/components/Container';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Image as ImageIcon, Lightbulb } from 'lucide-react';

const LatihanPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
            ← Kembali 
          </button>

          <div className="bg-light-blue text-primary-blue text-xs px-3 py-1 rounded-full font-semibold">
            3/5
          </div>
        </div>

        {/* INSTRUKSI */}
        <div className="bg-light-blue rounded-2xl p-6 text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-blue mb-2">
            Instruksi
          </h1>

          <p className="text-gray-600 text-sm max-w-xl mx-auto">
            Tunjukkan isyarat untuk huruf "G". Posisikan tanganmu di dalam
            bingkai kamera dan tahan selama 2 detik
          </p>
        </div>

        {/* REFERENSI & KAMERA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          {/* REFERENSI */}
          <div>
            <p className="text-sm font-semibold text-center mb-3 text-gray-600">
              REFERENSI
            </p>

            <div className="w-full h-48 bg-light-blue rounded-2xl flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center text-white">
                <ImageIcon size={24} />
              </div>
            </div>
          </div>

          {/* KAMERA */}
          <div>
            <p className="text-sm font-semibold text-center mb-3 text-gray-600">
              KAMERA ANDA
            </p>

            <div className="w-full h-48 bg-light-blue rounded-2xl flex items-center justify-center relative overflow-hidden">
              
              <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center text-white z-10">
                <Camera size={24} />
              </div>

              {/* frame */}
              <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none" />
            </div>
          </div>

        </div>

        {/* FEEDBACK AI */}
        <div className="text-center mb-8">
          <p className="text-primary-blue font-semibold mb-2">
            Feedback AI
          </p>

          {/* loader */}
          <div className="flex justify-center mb-2">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-dark-gray rounded-full animate-spin" />
          </div>

          <p className="text-xs text-gray-500 mb-4">Akurasi</p>

        {/* progress */}
        <div className="w-full h-3 bg-gray-200 rounded-full">
          <div className="w-[35%] h-3 bg-blue-500 rounded-full"></div>
        </div>

        <p className="text-xs text-gray-600 mt-2">35%</p>
      </div>

      {/* ACTION */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">

        <button onClick={() => window.location.reload()} className="bg-white border border-blue-500 text-blue-500 px-6 py-3 rounded-full text-sm font-semibold hover:bg-blue-50 active:scale-95 transition-all">
          Coba Lagi
        </button>

        <button onClick={() => navigate(`/modul/${id || 'dasar'}/hasil`)} className="bg-blue-500 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-blue-600 active:scale-95 transition-all">
          Selanjutnya
        </button>

      </div>

        {/* TIPS */}
        <div className="flex items-start gap-2 text-sm text-gray-500 max-w-xl mx-auto">
          <Lightbulb size={18} className="text-secondary shrink-0 mt-0.5" />
          <p>
            Tips: Pastikan pencahayaan cukup dan latar belakang tidak terlalu ramai
            agar deteksi lebih akurat.
          </p>
        </div>

      </Container>
    </div>
  );
};

export default LatihanPage;