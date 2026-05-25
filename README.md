# 📊 HANDIGO — Platform Pembelajaran Bahasa Isyarat Berbasis AI

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.x-4fc08d?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/Azure_Web_Apps-Deploy-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white" alt="Azure">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/YOLO-AI_Vision-00FFFF?style=for-the-badge&logo=yolo&logoColor=black" alt="YOLO">
  <img src="https://img.shields.io/badge/Cloudinary-CDN-3449C2?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary">
</p>


Aplikasi pembelajaran bahasa isyarat dengan menerapkan computer vision sebagai penunjang pembelajaran

Handy Team
Ketua Kelompok:

* Anggota 1:  Warda Saniia Fawahaana - 23/518824/TK/57170
* Anggota 2: Fanny Elisabeth Panjaitan - 23/518300/TK/57035
* Anggota 3:  Muhammad Mulat Adi Wardhana - 23/522856/TK/57765



---

## 🔗 Link Akses Distribusi & Aplikasi
* **Frontend Web App (Live):** [https://handigo-five.vercel.app/](https://handigo-five.vercel.app/)
* **Backend API Gateway:** [https://handigo-be-aybwazffcmgxdcf2.southeastasia-01.azurewebsites.net/](https://handigo-be-aybwazffcmgxdcf2.southeastasia-01.azurewebsites.net/)
* **Dokumentasi Project:** [wrdsnf.github.io/Handigo](https://wrdsnf.github.io/Handigo)

> [!IMPORTANT]
> **Kredensial Akun Uji Coba (Untuk Dosen Penguji / Demo Sesi):**
> * **Email:** `handigo@gmail.com`
> * **Password:** `handigo123`

---

## 👥 Tim Pengembang (Handy Team)
Proyek ini dikembangkan sebagai **Senior Project Teknologi Informasi 2026**, Departemen Teknologi Elektro dan Teknologi Informasi, Fakultas Teknik, Universitas Gadjah Mada.

| Peran | Nama | NIM | Fokus Kontribusi |
| :---: | --- | --- | --- |
| 👩‍💻 | **Fanny Elisabeth Panjaitan** | 23/518300/TK/57035 | Project Manager, Cloud Engineer |
| 👩‍💻 | **Warda Saniia Fawahaana** | 23/518824/TK/57170 | Software Engineer (Frontend & Backend) |
| 👨‍💻 | **Muhammad Mulat Adi Wardhana** | 23/522856/TK/57765 | UX Designer, AI Engineer |

---

## 📌 1. Latar Belakang & Masalah
Berdasarkan data **WHO (2024)**, terdapat **1,5 miliar orang** di dunia yang mengalami gangguan pendengaran, dan sekitar **2,6 juta jiwa** berada di Indonesia (BPS & Kemensos). Masalah utama yang dihadapi meliputi:
* Akses pembelajaran bahasa isyarat terstruktur masih sangat terbatas dan mahal.
* Platform edukasi yang ada saat ini mayoritas bersifat **statis** (hanya video/teks tunggal).
* Tidak adanya fitur evaluasi interaktif secara mandiri yang mampu memberikan timbal balik (*feedback*) seketika.

---

## 🎯 2. Tujuan Sistem
1. **Inklusivitas & Aksesibilitas:** Menyediakan platform gratis berbasis web yang responsif dan mudah diakses via browser.
2. **Interaktivitas Berbasis AI:** Mengintegrasikan model visi komputer canggih (YOLO) untuk klasifikasi gerakan isyarat alfabet dan angka.
3. **Automated Feedback:** Memberikan penilaian akurasi gerakan pengguna secara otomatis, instan, dan presisi.
4. **Secure Data Persistance:** Mengelola retensi data pengguna, otentikasi berbasis token, serta statistik belajar secara aman di cloud database.

---

## 🏗️ 3. Arsitektur Software
Handigo menggunakan arsitektur modern **Decoupled Client-Server (Terpisah)** untuk memastikan modularitas, skalabilitas tinggi, serta kemudahan dalam proses deployment terdistribusi.

---
### Alasan Pemilihan Tech Stack:
* **Vue.js 3 & Vite:** Struktur komponen UI reaktif, performa bundling super cepat, serta optimal untuk menangani rendering video stream secara real-time.
* **Express.js (Node.js):** Minimalist framework backend yang sangat cepat dalam memproses I/O request, ideal sebagai API Gateway penghubung antara model AI dan Database.
* **YOLO (You Only Look Once):** Algoritma *state-of-the-art* untuk object detection. Sangat tangguh dalam mengenali pola bentuk geometri tangan (*spatial features*) meskipun dalam kondisi pencahayaan minim jika dibandingkan metode landmark tradisional.

---

## 🌐 4. Implementasi Jaringan Komputer
Aspek jaringan komputer difokuskan pada manajemen keamanan transportasi data ujung-ke-ujung (*end-to-end security*) dan komunikasi antar platform.

* **Protokol Transportasi:** Seluruh komunikasi dari pengguna ke web frontend, serta dari frontend menuju backend wajib berjalan di atas protokol aman **HTTPS (Port 443)** dengan enkripsi **TLS 1.3**.
* **Mekanisme Otentikasi Sesi (JWT Cookies):**
  1. Pengguna mengirimkan kredensial melalui skema REST API.
  2. Server backend (Express) memvalidasi data dan menggenerasi **JWT (JSON Web Token)**.
  3. Token JWT tersebut dikirimkan kembali dan disimpan di sisi browser klien menggunakan metode **Secure Cookies** (dengan flag `HttpOnly` & `SameSite` untuk menangkal serangan *Cross-Site Scripting (XSS)* dan *Cross-Site Request Forgery (CSRF)*).
* **Komunikasi Data (REST API):** Payload data dikirimkan dalam format standar JSON secara asinkronus (Axios/Fetch API).

---

## ☁️ 5. Implementasi Komputasi Awan (Cloud Computing)
Proyek ini mengadopsi lingkungan **Multi-Cloud Ecosystem** guna mendistribusikan beban komputasi secara optimal sesuai spesialisasi arsitektur cloud:

1. **Frontend Deployment (Vercel):** Menghos-kan berkas statis Vue.js. Memanfaatkan fitur global CDN Edge Network untuk mempercepat loading awal aplikasi di regional Indonesia.
2. **Backend Engine Deployment (Microsoft Azure App Service):** Backend Express.js di-deploy ke Azure Web Apps dengan region **Southeast Asia**. Dipilih karena infrastruktur Azure menyediakan manajemen isolasi kontainer server yang andal dan komputasi yang stabil untuk penanganan logika AI.
3. **Database Cloud (Supabase Managed PostgreSQL):** Digunakan murni sebagai Relational Database Management System (RDBMS) yang menyimpan data relasi antar modul, skor latihan, dan profil pengguna.
4. **Image CDN Asset Management (Cloudinary):** Seluruh aset gambar statis seperti ilustrasi modul, panduan bahasa isyarat, dan avatar user disimpan dan didistribusikan melalui CDN Cloudinary untuk menghemat bandwidth server utama melalui optimasi ukuran gambar otomatis.

---

## 🤖 6. Implementasi Kecerdasan Buatan (AI)
Klasifikasi bahasa isyarat diimplementasikan menggunakan arsitektur visi komputer berbasis **YOLO**.

* **Ekstraksi Fitur Fisik:** Video stream yang ditangkap via WebRTC di sisi klien diproses oleh pipeline visi komputer untuk mendeteksi *bounding box* area tangan.
* **Model Inferensi (YOLO):** Model telah dilatih khusus untuk mengenali kelas alfabet dan angka pada sistem isyarat BISINDO/SIBI. YOLO membaca seluruh matriks frame gambar dalam satu kali proses kalkulasi jaringan saraf tiruan (*Single Forward Pass*), menjadikannya sangat cepat dalam mendeteksi objek isyarat tangan secara dinamis.
* **Skor Akurasi:** Output probabilitas dari layer klasifikasi YOLO dikonversi menjadi *Confidence Score* (%) yang dikirim ke backend untuk menentukan apakah gerakan tangan pengguna dikategorikan benar atau salah.

---

## 🧪 7. Software Testing
Kami menerapkan pendekatan **Multi-Level Testing** untuk menjamin kestabilan integrasi antara sistem frontend, backend Express, dan basis data di cloud.

### Manual End-to-End (E2E) Test Suite
| ID | Skenario Pengujian | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :---: | :--- | :--- | :--- | :---: |
| TS-01 | Autentikasi User (JWT) | Login dengan akun `handigo@gmail.com` | Token JWT berhasil di-inject ke dalam Cookies browser, redirect ke dashboard | ✅ Pass |
| TS-02 | REST API Fetching | Masuk ke menu modul belajar | Frontend berhasil melakukan `GET` request ke Azure Web App dan merender data modul dari database Supabase | ✅ Pass |
| TS-03 | Content CDN Loading | Membuka panduan gambar isyarat | Gambar panduan termuat secara instan melalui url Cloudinary CDN | ✅ Pass |
| TS-04 | Inferensi Kamera AI | Mengaktifkan kamera pada modul latihan dan melakukan isyarat tangan | Model YOLO mendeteksi objek tangan, mengklasifikasi huruf, dan memicu status evaluasi | ✅ Pass |

---

## 📂 8. Struktur Direktori Proyek
```text
handigo/
├── .github/workflows/    # Konfigurasi otomasi CI/CD (GitHub Actions)
├── docs/                 # Kode sumber dokumentasi sistem (GitHub Pages)
├── frontend/             # IMPLEMENTASI FRONTEND (Vue.js 3 + Vite)
│   ├── src/
│   │   ├── components/   # Komponen UI modular (Navbar, CameraView, Card)
│   │   ├── views/        # Halaman Aplikasi (Home, Dashboard, Latihan, Profil)
│   │   └── main.js       # Inisialisasi utama aplikasi Vue
│   └── vite.config.js    # Konfigurasi Vercel deployment & bundler Vite
└── backend/              # IMPLEMENTASI BACKEND (Express.js Engine)
    ├── config/           # Koneksi Database Supabase & Cloudinary SDK
    ├── controllers/      # Logika bisnis aplikasi & pengolahan data AI
    ├── middleware/       # Verifikasi keamanan token JWT Cookie
    ├── routes/           # Endpoint REST API Routing
    └── server.js         # Entrypoint utama server Node.js (Azure Web App)

```

---
