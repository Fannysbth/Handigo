import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import FeatureGrid from '@/components/FeatureGrid';
import ModulePreview from '@/components/ModulePreview';
import Cta from '@/components/Cta';

const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Remove the '#' character
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="bg-white text-gray-800 antialiased w-full">
      <Hero />
      <Stats />
      <FeatureGrid />
      <ModulePreview />
      <Cta />
    </div>
  );
};

export default HomePage;
