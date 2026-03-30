import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import FeatureGrid from '@/components/FeatureGrid';
import ModulePreview from '@/components/ModulePreview';
import Cta from '@/components/Cta';
import Footer from '@/components/Footer';

const HomePage = () => {
  return (
    <div className="bg-white text-gray-800 antialiased mx-auto max-w-[1200px]">
      <Hero />
      <Stats />
      <FeatureGrid />
      <ModulePreview />
      <Cta />
      <Footer />
    </div>
  );
};

export default HomePage;
