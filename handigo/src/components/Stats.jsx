import { useState, useEffect } from 'react';
import Container from './Container';
import { fetchDashboardStats } from '../lib/api';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
        // Fallback to static data
        setStats({
          total_users: '12,000+',
          total_modules: '10+',
          total_signs: '100+',
        });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return null; // Or loading spinner

  return (
    <section className="mb-16 md:mb-20">
      <Container>
        <div className="bg-dark-gray rounded-2xl sm:rounded-[3rem] py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 flex flex-col md:flex-row justify-around items-center gap-6 md:gap-0 text-center text-white">
          <div className="w-full md:w-auto">
            <h3 className="text-4xl font-bold mb-2">{stats?.total_users || '12,000+'}</h3>
            <p className="text-gray-400 text-sm">Pengguna</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-gray-600"></div>
          <div className="block md:hidden h-px w-32 bg-gray-600"></div>
          <div className="w-full md:w-auto">
            <h3 className="text-4xl font-bold mb-2">{stats?.total_modules || '10+'}</h3>
            <p className="text-gray-400 text-sm">Modul</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-gray-600"></div>
          <div className="block md:hidden h-px w-32 bg-gray-600"></div>
          <div className="w-full md:w-auto">
            <h3 className="text-4xl font-bold mb-2">{stats?.total_signs || '100+'}</h3>
            <p className="text-gray-400 text-sm">Kosakata Isyarat</p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Stats;
