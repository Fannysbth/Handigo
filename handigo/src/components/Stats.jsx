const Stats = () => {
  return (
    <section className="px-8 mb-20">
      <div className="bg-dark-gray rounded-[3rem] py-12 px-8 flex flex-col md:flex-row justify-around text-center text-white">
        <div>
          <h3 className="text-4xl font-bold mb-2">12,000+</h3>
          <p className="text-gray-400 text-sm">Pengguna</p>
        </div>
        <div className="hidden md:block w-px bg-gray-600"></div>
        <div>
          <h3 className="text-4xl font-bold mb-2">10+</h3>
          <p className="text-gray-400 text-sm">Modul</p>
        </div>
        <div className="hidden md:block w-px bg-gray-600"></div>
        <div>
          <h3 className="text-4xl font-bold mb-2">100+</h3>
          <p className="text-gray-400 text-sm">Kosakata Isyarat</p>
        </div>
      </div>
    </section>
  );
};

export default Stats;
