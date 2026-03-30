import iconAi from '../assets/icons/icon-ai.png';
import iconCamera from '../assets/icons/icon-camera.png';
import iconProgress from '../assets/icons/icon-progress.png';
import iconCloud from '../assets/icons/icon-cloud.png';

const features = [
  {
    icon: iconAi,
    title: "Deteksi Gerakan AI",
    desc: "Sistem mendeteksi gerakan tangan kamu secara real-time menggunakan computer vision",
  },
  {
    icon: iconCamera,
    title: "Latihan via Kamera",
    desc: "Praktikkan langsung isyarat di depan kamera dan dapatkan skor akurasi seketika",
  },
  {
    icon: iconProgress,
    title: "Pantau Progresmu",
    desc: "Lihat perkembangan belajarmu dari waktu ke waktu lewat dashboard progres",
  },
  {
    icon: iconCloud,
    title: "Tersimpan di Cloud",
    desc: "Akun dan progres belajar tersinkronisasi di semua perangkatmu",
  },
];

const FeatureGrid = () => {
  return (
    <section id="fitur" className="scroll-mt-24 px-8 mb-20">
      <h2 className="text-3xl font-bold text-primary-blue text-center mb-10">
        Fitur Utama
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((item, index) => (
          <div
            key={index}
            className="bg-light-blue p-8 rounded-3xl hover:shadow-md transition"
          >
            {/* ICON WRAPPER */}
            <div className="w-12 h-12 flex items-center justify-center mb-4">
              <img
                src={item.icon}
                alt={item.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <h4 className="font-bold text-gray-900 mb-2">
              {item.title}
            </h4>

            <p className="text-gray-600 text-sm leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;