import { test, expect } from '@playwright/test';

test.describe('Profile Testing', () => {

  // 1. TAMBAHKAN SETUP LOGIN SEBELUM MASING-MASING TEST BERJALAN
  test.beforeEach(async ({ page }) => {
    // Alur login agar aplikasi memiliki sesi/token aktif
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'handigo@gmail.com'); // Ganti dengan email valid
    await page.fill('input[type="password"]', 'handigo123');     // Ganti dengan password valid
    await page.click('button[type="submit"]');

    // Pastikan masuk ke dashboard sebelum pindah ke profile
    await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => null);
  });

  // ==========================================
  // TC-01: Melihat halaman profil pengguna
  // ==========================================
  test('Melihat halaman profil pengguna', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');

    // Tunggu komponen LoadingSpinner hilang
    await expect(page.locator('text=Memuat profil...')).toBeHidden({ timeout: 10000 });

    // Verifikasi bahwa label InfoItem benar-benar dirender oleh React
    await expect(page.locator('text=Nama Lengkap')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    
    // Memastikan ada tombol aksi
    await expect(page.locator('button:has-text("Edit Profil")')).toBeVisible();
  });

  // ==========================================
  // TC-02: Edit nama profil berhasil
  // ==========================================

  test('Edit profile berhasil memperbarui nama lengkap', async ({ page }) => {
    // Navigasi langsung ke halaman profil
    await page.goto('http://localhost:5173/profile');
    await expect(page.locator('text=Memuat profil...')).toBeHidden();

    // Klik tombol Edit Profil untuk pindah ke halaman Settings
    await page.click('button:has-text("Edit Profil")');
    await page.waitForURL('**/settings', { timeout: 5000 });

    // Tunggu hingga loading fetchProfile selesai di halaman Settings
    await expect(page.locator('text=Memuat profile...')).toBeHidden({ timeout: 5000 });

    // Cari input berdasarkan atribut [name="full_name"]
    const inputNama = page.locator('input[name="full_name"]');
    await expect(inputNama).toBeVisible();

    // Bersihkan data lama, lalu isi dengan nama yang baru
    await inputNama.click();
    await inputNama.clear(); // Memastikan input benar-benar kosong sebelum diisi
    await inputNama.fill('Andi Baru');

    // Klik tombol "Simpan Perubahan" dan tunggu proses API update selesai
    const btnSimpan = page.locator('button:has-text("Simpan Perubahan")');
    await btnSimpan.click();

    // Pastikan sistem melakukan redirect kembali ke halaman profil setelah sukses
    await page.waitForURL('**/profile', { timeout: 5000 });
    
    // FIX AMAN: Berikan jeda waktu 2 detik agar context user/API backend 
    // selesai menulis data ke database sebelum halaman profile melakukan fetch ulang
    await page.waitForTimeout(2000);
    
    // Paksa halaman melakukan reload agar data profile paling fresh ditarik dari DB
    await page.reload();
    await expect(page.locator('text=Memuat profil...')).toBeHidden();

    // Validasi akhir: Gunakan pencarian teks yang lebih fleksibel
    const namaUser = page.locator('h2, .bg-light-blue').filter({ hasText: 'Andi Baru' }).first();
    await expect(namaUser).toBeVisible({ timeout: 5000 });
  });

  // ==========================================
  // TC-03: Logout berhasil dan sesi dihapus
  // ==========================================
  test('Logout berhasil dan konfirmasi popup disetujui', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    await expect(page.locator('text=Memuat profil...')).toBeHidden();

    // FIX: Tangkap event window.confirm bawaan browser, lalu klik "OK/Yes"
    page.on('dialog', async (dialog) => {
      // Pastikan pesan alert sesuai dengan yang di kode frontend
      expect(dialog.message()).toContain('Yakin ingin keluar?');
      await dialog.accept(); 
    });

    // Klik tombol logout
    await page.click('button:has-text("Logout")');

    // Pastikan ter-redirect ke halaman login
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

});