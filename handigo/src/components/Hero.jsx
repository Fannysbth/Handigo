import charImg from '../assets/char1.png';
import Container from '@/components/Container';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header id="tentang" className="scroll-mt-24 pt-8 pb-16 md:py-20">
      <Container className="flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold text-primary-blue leading-tight mb-6">
            Belajar Isyarat,<br />Bangun Koneksi.
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Belajar Bahasa Isyarat Gratis & Interaktif. Platform pembelajaran bahasa isyarat berbasis AI dengan umpan balik gerakan tangan secara real-time. Gratis, mudah diakses, tanpa instalasi.
          </p>
          <button 
            onClick={() => navigate(user ? "/dashboard" : "/register")}
            className="inline-block bg-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 active:scale-95 transition-all mb-10"
          >
            Mulai
          </button>
          
          <div className="flex flex-col sm:flex-row gap-4 text-xs font-medium text-gray-500">
            <span className="border border-gray-300 rounded-full px-4 py-2 flex items-center gap-2">✓ Gratis</span>
            <span className="border border-gray-300 rounded-full px-4 py-2 flex items-center gap-2">✓ Feedback AI otomatis</span>
            <span className="border border-gray-300 rounded-full px-4 py-2 flex items-center gap-2">✓ Tanpa Di Install</span>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-end">
          <img src={charImg} alt="Ilustrasi" className="rounded-3xl object-cover w-full max-w-md" />
        </div>
      </Container>
    </header>
  );
};

export default Hero;
