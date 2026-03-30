import { useNavigate } from "react-router-dom";

const Cta = () => {
  const navigate = useNavigate();

  return (
    <section className="text-center px-8 mb-20">
      <h2 className="text-3xl md:text-4xl font-bold text-primary-blue mb-8 leading-tight">
        Mulai perjalanan belajarmu sekarang.<br />Gratis, selamanya.
      </h2>

      <button
        className="bg-dark-gray text-white px-8 py-4 rounded-full font-bold hover:bg-black transition"
        onClick={() => navigate("/register")}
      >
        Daftar Sekarang — Gratis
      </button>
    </section>
  );
};

export default Cta;