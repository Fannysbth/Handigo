import logoImg from '../assets/handigo-logo.png';
import Container from '@/components/Container';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 py-8 text-xs text-gray-500">
      <Container className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-center md:text-left">
          <img src={logoImg} alt="Logo" className="w-6 h-6" />
          <span>Handigo © 2026 | Dibuat oleh Handy Team — DTETI FT UGM</span>
        </div>
        <div className="flex gap-6">
          <Link to="#" className="hover:text-gray-800">Privacy</Link>
          <Link to="#" className="hover:text-gray-800">Terms</Link>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
