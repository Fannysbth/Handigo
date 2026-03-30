import charImg from '../assets/char1.png';

const Hero = () => {
  return (
    <header id="tentang" className="scroll-mt-24 flex flex-col md:flex-row items-center justify-between px-8 py-16 gap-10">
      <div className="max-w-xl">
        <h1 className="text-5xl font-bold text-primary-blue leading-tight mb-6">
          Belajar Isyarat,<br />Bangun Koneksi.
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Belajar Bahasa Isyarat Gratis & Interaktif. Platform pembelajaran bahasa isyarat berbasis AI dengan umpan balik gerakan tangan secara real-time. Gratis, mudah diakses, tanpa instalasi.
        </p>
        <button className="bg-dark-gray text-white px-8 py-3 rounded-full font-semibold hover:bg-black transition mb-10">
          Mulai
        </button>
        
        <div className="flex gap-4 text-xs font-medium text-gray-500">
          <span className="border border-gray-300 rounded-full px-4 py-2 flex items-center gap-2">✓ Gratis</span>
          <span className="border border-gray-300 rounded-full px-4 py-2 flex items-center gap-2">✓ Feedback AI otomatis</span>
          <span className="border border-gray-300 rounded-full px-4 py-2 flex items-center gap-2">✓ Tanpa Di Install</span>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex justify-end">
        <img src={charImg} alt="Ilustrasi" className="rounded-3xl object-cover" />
      </div>
    </header>
  );
};

export default Hero;
