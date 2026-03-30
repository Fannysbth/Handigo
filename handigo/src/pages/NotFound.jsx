import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg p-4 text-center">
      <div className="max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-text mb-8">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold transition"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
