import { Link } from 'react-router-dom';
import Container from '@/components/Container';

const LearnPage = () => {
  return (
    <div className="flex-1 flex flex-col bg-white">
      
      {/* Top Header / App Bar */}
      <header className="border-b border-card-border shrink-0">
        <Container className="flex items-center justify-between py-4">
          <Link to="/" className="p-2 -ml-2 text-gray-text hover:text-dark">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-bold text-dark text-lg">Huruf A</h1>
          <button className="p-2 -mr-2 text-gray-text hover:text-dark">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </button>
        </Container>
      </header>

      {/* Content Area (Scrollable if needed) */}
      <Container className="flex-1 overflow-y-auto py-6 flex flex-col">
        
        {/* Video / AI Camera Placeholder (Strict 16:9 ratio) */}
        <div className="w-full max-w-3xl mx-auto aspect-video bg-dark rounded-2xl overflow-hidden relative shadow-md">
          {/* Placeholder content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2"></rect>
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M7 21l3-4h4l3 4"></path>
            </svg>
            <span className="text-sm font-medium">Kamera Aktif</span>
          </div>
          
          {/* Framing Guide lines */}
          <div className="absolute inset-4 border-2 border-dashed border-white/20 rounded-xl pointer-events-none"></div>
        </div>

        {/* Main Progress Bar (Yellow #FFB800 underneath the camera) */}
        <div className="mt-6 w-full max-w-3xl mx-auto">
          <div className="flex justify-between text-xs text-gray-text mb-1.5 font-medium">
            <span>Akurasi Gerakan</span>
            <span className="text-secondary font-bold">85%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-secondary transition-all duration-300 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="mt-8 text-center flex-1">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-primary">A</span>
          </div>
          <h2 className="text-xl font-bold text-dark">Genggam Seluruh Jari</h2>
          <p className="text-gray-text text-sm mt-2 max-w-[280px] mx-auto leading-relaxed">
            Kecuali ibu jari, biarkan lurus menempel di sisi samping telunjuk.
          </p>
        </div>
        
      </Container>
    </div>
  );
};

export default LearnPage;
