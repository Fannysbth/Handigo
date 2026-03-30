import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';

function MainLayout() {
  return (
    <div className="relative min-h-screen bg-light-bg pt-24">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area where Router views inject */}
      <main className="w-full h-full flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
