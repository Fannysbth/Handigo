import Container from '@/components/Container';

const DictionaryPage = () => {
  return (
    <div className="flex-1 flex flex-col bg-light-bg py-6">
      <Container className="flex-1 flex flex-col">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-dark">Kamus Isyarat</h1>
          <p className="text-sm text-gray-text mt-1">Cari dan pelajari kata per kata</p>
        </header>

        <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-card-border p-6 text-center shadow-sm">
          <div>
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <p className="text-gray-text font-medium">Modul Kamus akan segera hadir</p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DictionaryPage;
