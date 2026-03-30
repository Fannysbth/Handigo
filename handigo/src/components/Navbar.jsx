import { Link, NavLink } from 'react-router-dom';
import clsx from 'clsx';
import logoImg from '../assets/handigo-logo.png';

const Navbar = () => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50
  w-[95%] max-w-[1200px]
  bg-dark-gray text-white
  px-8 py-4
  flex justify-between items-center
  rounded-full
  shadow-lg border border-white/10">
      <div className="w-full max-w-[1200px] flex justify-between items-center">
        <div className="font-bold text-lg flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="w-6 h-6" /> Handigo
          </Link>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
            <button 
              onClick={() => scrollToSection('tentang')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Tentang
            </button>
            <button 
              onClick={() => scrollToSection('fitur')} 
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
          <Link to="/login" className="bg-white text-blue-900 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition cursor-pointer">
            Masuk
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
