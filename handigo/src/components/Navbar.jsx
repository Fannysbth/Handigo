import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import logoImg from '../assets/handigo-logo.png';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleScroll = (id) => {
    if (location.pathname !== '/') {
      navigate('/#' + id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50
      w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
      transition-all duration-300">
      <div className="w-full bg-dark-gray text-white px-8 py-4 flex justify-between items-center rounded-full shadow-lg border border-white/10">
        <div className="font-bold text-lg flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="w-6 h-6" /> Handigo
          </Link>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
            {user && (
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => clsx("hover:text-white transition-colors cursor-pointer", isActive && "text-white font-bold")}
              >
                Dashboard
              </NavLink>
            )}
            <button 
              onClick={() => handleScroll('tentang')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Tentang
            </button>
            <button 
              onClick={() => handleScroll('fitur')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Fitur
            </button>
            <NavLink 
              to="/modul" 
              className={({ isActive }) => clsx("hover:text-white transition-colors cursor-pointer", isActive && "text-white font-bold")}
            >
              Modul
            </NavLink>
          </div>
          {user ? (
            <Link to="/profile" className="flex items-center justify-center w-10 h-10 bg-primary-blue text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </Link>
          ) : (
            <Link to="/login" className="bg-white text-blue-900 px-6 py-2 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer">
              Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
