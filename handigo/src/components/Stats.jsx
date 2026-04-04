import Container from '@/components/Container';

const Stats = () => {
  return (
    <section className="mb-16 md:mb-20">
      <Container>
        <div className="bg-dark-gray rounded-[3rem] py-10 md:py-12 px-6 md:px-8 flex flex-col md:flex-row justify-around items-center gap-8 md:gap-0 text-center text-white">
          <div className="w-full md:w-auto">
            <h3 className="text-4xl font-bold mb-2">12,000+</h3>
            <p className="text-gray-400 text-sm">Pengguna</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-gray-600"></div>
          <div className="block md:hidden h-px w-32 bg-gray-600"></div>
          <div className="w-full md:w-auto">
            <h3 className="text-4xl font-bold mb-2">10+</h3>
            <p className="text-gray-400 text-sm">Modul</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-gray-600"></div>
          <div className="block md:hidden h-px w-32 bg-gray-600"></div>
          <div className="w-full md:w-auto">
            <h3 className="text-4xl font-bold mb-2">100+</h3>
            <p className="text-gray-400 text-sm">Kosakata Isyarat</p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Stats;
