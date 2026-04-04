import { useNavigate } from "react-router-dom";
import Container from '@/components/Container';
import { useAuth } from '../context/AuthContext';

const Cta = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="text-center mb-16 md:mb-20">
      <Container>
        <h2 className="text-3xl md:text-4xl font-bold text-primary-blue mb-8 md:mb-10 leading-tight">
          Mulai perjalanan belajarmu sekarang.<br />Gratis, selamanya.
        </h2>

        <button
          className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-600 active:scale-95 transition-all"
          onClick={() => navigate(user ? "/dashboard" : "/register")}
        >
          {user ? "Lanjutkan Belajar" : "Daftar Sekarang — Gratis"}
        </button>
      </Container>
    </section>
  );
};

export default Cta;