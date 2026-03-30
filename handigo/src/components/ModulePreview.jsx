import { useNavigate } from "react-router-dom";

const modules = [
  { title: "Dasar", desc: "Alfabet & Angka", path: "/modul/dasar" },
  { title: "Menengah", desc: "Kosakata Umum", path: "/modul/menengah" },
  { title: "Lanjutan", desc: "Kalimat Sehari-hari", path: "/modul/lanjutan" },
];

const ModulePreview = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-light-blue py-12 px-8 mb-20 rounded-[3rem]">
      <h2 className="text-2xl md:text-3xl font-bold text-primary-blue text-center mb-8">
        Preview Modul
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {modules.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className="bg-dark-gray text-white px-6 py-5 
                       rounded-[2rem] cursor-pointer
                       flex flex-col justify-between
                       transition-all duration-200
                       hover:scale-[1.02] hover:shadow-xl"
          >
            {/* TEXT */}
            <div>
              <h4 className="text-lg font-bold leading-tight">
                {item.title}
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                {item.desc}
              </p>
            </div>

            {/* BUTTON MINI */}
            <div className="mt-4">
              <span className="text-xs bg-white text-blue-900 px-4 py-1.5 rounded-full font-semibold">
                Lihat Selengkapnya...
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ModulePreview;