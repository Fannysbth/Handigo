import logoImg from '../assets/handigo-logo.png';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 py-8 px-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
      <div className="flex items-center gap-2">
        <img src={logoImg} alt="Logo" className="w-6 h-6" />
        Handigo © 2026 | Dibuat oleh Handy Team — DTETI FT UGM
      </div>
      <div className="flex gap-6">
        <a href="#" className="hover:text-gray-800">Privacy</a>
        <a href="#" className="hover:text-gray-800">Terms</a>
      </div>
    </footer>
  );
};

export default Footer;
