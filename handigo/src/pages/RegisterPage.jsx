import { useState } from "react";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-28 px-4">
      
      {/* CARD */}
      <div className="w-full max-w-md bg-blue-100 rounded-3xl shadow-lg p-8">
        
        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">
          Buat Akun Baru
        </h1>
        <p className="text-center text-blue-800 text-sm mb-6">
          Bergabung dan mulai belajar bahasa isyarat hari ini
        </p>

        {/* FORM */}
        <form className="flex flex-col gap-4">
          
          {/* NAMA */}
          <div>
            <label className="text-xs text-blue-900">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs text-blue-900">Email</label>
            <input
              type="email"
              placeholder="contoh@email.com"
              className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <label className="text-xs text-blue-900">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-300 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500"
            >
              👁
            </button>
          </div>

          {/* KONFIRM PASSWORD */}
          <div className="relative">
            <label className="text-xs text-blue-900">Konfirmasi Password</label>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Ulangi password"
              className="w-full mt-1 px-4 py-2 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-300 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-[34px] text-gray-500"
            >
              👁
            </button>
          </div>

          {/* BUTTON REGISTER */}
          <button
            type="submit"
            className="mt-2 bg-dark-gray text-white py-2 rounded-full font-semibold hover:opacity-90 transition"
          >
            Daftar
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-[1px] bg-gray-300"></div>
            <span className="text-xs text-gray-500">Atau</span>
            <div className="flex-1 h-[1px] bg-gray-300"></div>
          </div>

          {/* LOGIN */}
          <Link
            to="/login"
            className="bg-dark-gray text-white text-center py-2 rounded-full font-semibold hover:opacity-90 transition"
          >
            Sudah punya akun? Masuk
          </Link>

          {/* GOOGLE */}
          <button
            type="button"
            className="bg-dark-gray text-white py-2 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <span className="text-lg">G</span> Google
          </button>

        </form>
      </div>
    </div>
  );
};

export default RegisterPage;