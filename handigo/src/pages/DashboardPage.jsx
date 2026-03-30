import { Link } from 'react-router-dom';

function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        <p className="mt-2 text-gray-text">Coming soon...</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">← Kembali ke Beranda</Link>
      </div>
    </div>
  );
}

export default DashboardPage;
