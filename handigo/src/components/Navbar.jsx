import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import clsx from 'clsx';
import logoImg from '../assets/handigo-logo.png';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-primary-blue">Handigo</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => handleScroll('hero')} className="text-gray-700 hover:text-primary-blue transition">
              Beranda
            </button>
            <button onClick={() => handleScroll('features')} className="text-gray-700 hover:text-primary-blue transition">
              Fitur
            </button>
            <button onClick={() => handleScroll('modules')} className="text-gray-700 hover:text-primary-blue transition">
              Modul
            </button>
            <button onClick={() => handleScroll('cta')} className="text-gray-700 hover:text-primary-blue transition">
              Mulai
            </button>
          </div>

          {/* USER MENU */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-blue transition">
                  Dashboard
                </Link>
                <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center text-white font-semibold">
                  {user.full_name?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <Link to="/profile" className="text-gray-700 hover:text-primary-blue transition">
                  {user.full_name || user.name || 'Profil'}
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-700 hover:text-primary-blue transition">
                  Masuk
                </Link>
                <Link to="/register" className="bg-primary-blue text-white px-4 py-2 rounded-full hover:bg-primary-hover transition">
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-blue"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <button onClick={() => handleScroll('hero')} className="text-left text-gray-700 hover:text-primary-blue transition">
                Beranda
              </button>
              <button onClick={() => handleScroll('features')} className="text-left text-gray-700 hover:text-primary-blue transition">
                Fitur
              </button>
              <button onClick={() => handleScroll('modules')} className="text-left text-gray-700 hover:text-primary-blue transition">
                Modul
              </button>
              <button onClick={() => handleScroll('cta')} className="text-left text-gray-700 hover:text-primary-blue transition">
                Mulai
              </button>
              
              <div className="border-t border-gray-200 pt-4">
                {user ? (
                  <div className="flex flex-col space-y-3">
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-primary-blue transition">
                      Dashboard
                    </Link>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-primary-blue transition">
                      {user.full_name || user.name || 'Profil'}
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-primary-blue transition">
                      Masuk
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="bg-primary-blue text-white px-4 py-2 rounded-full text-center hover:bg-primary-hover transition">
                      Daftar
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
