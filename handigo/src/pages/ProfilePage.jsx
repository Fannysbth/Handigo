const ProfilePage = () => {
  return (
    <div className="px-5 py-6 flex flex-col h-full bg-light-bg">
      <header className="mb-6 text-center pt-4">
        <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center text-3xl font-bold text-primary mb-3">
          U
        </div>
        <h1 className="text-xl font-bold text-dark">User Handigo</h1>
        <p className="text-sm text-gray-text">user@handigo.id</p>
      </header>

      <div className="flex-1 bg-white rounded-2xl border border-card-border p-4">
        <div className="py-3 border-b border-gray-100 flex justify-between items-center">
          <span className="text-dark font-medium">Pencapaian</span>
          <span className="text-primary font-bold">12 Modul</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
