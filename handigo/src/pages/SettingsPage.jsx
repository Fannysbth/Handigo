const SettingsPage = () => {
  return (
    <div className="px-5 py-6 flex flex-col h-full bg-light-bg">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Pengaturan</h1>
      </header>

      <div className="flex-1 bg-white rounded-2xl border border-card-border p-4">
        <div className="py-3 border-b border-gray-100 flex justify-between items-center text-dark">
          <span>Notifikasi</span>
          <div className="w-10 h-6 bg-primary rounded-full relative">
            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
          </div>
        </div>
        <div className="py-3 flex justify-between items-center text-red-500 font-medium">
          <span>Keluar</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
