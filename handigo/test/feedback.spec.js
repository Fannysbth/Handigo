import { test, expect } from '@playwright/test';

test.describe('Result Page Testing', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Proses Login ke Aplikasi
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'handigo@gmail.com');
    await page.fill('input[type="password"]', 'handigo123');
    await page.click('button[type="submit"]');
    
    // Tunggu redirect pasca-login selesai (toleransi jika backend mati/tidak merespon)
    await page.waitForURL('**/dashboard', { timeout: 3000 }).catch(() => null);

    // 2. MOCKING API (MENGGUNAKAN REGEX GLOBAL)
    // Mencakup seluruh URL yang mengandung kata "results/latest"
    await page.route(/\/results\/latest/, async (route) => {
      const mockResponse = {
        latest: {
          module_id: 'modul-123',
          exercise_id: 'ex-1',
          time_seconds: 45,
          exercises: { id: 'ex-1', sort_order: 1, title: 'Belajar Huruf A' }
        },
        nextExercises: [
          { id: 'ex-2', sort_order: 2, title: 'Belajar Huruf B' }
        ]
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });

    // 3. Masuk ke halaman hasil sesuai struktur React Router Anda
    await page.goto('http://localhost:5173/modul/modul-123/hasil'); 
    
    // Tunggu komponen LoadingSpinner menghilang dari DOM
    const spinner = page.locator('text=Memuat hasil...');
    await spinner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => null);
  });

  // ==========================================
  // TC-16: Melihat rangkuman hasil latihan
  // ==========================================
  test('Menampilkan rangkuman hasil durasi dan urutan latihan', async ({ page }) => {
    // Pastikan halaman tidak dialihkan secara paksa ke /modul oleh ProtectedRoute
    await expect(page).toHaveURL(/\/modul\/modul-123\/hasil/);

    await expect(page.locator('h2:has-text("Latihan Selesai")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('p:has-text("Latihan ke-1")')).toBeVisible();
    await expect(page.locator('p:has-text("Durasi: 45s")')).toBeVisible();
  });

  // ==========================================
  // TC-17: Melihat daftar latihan berikutnya
  // ==========================================
  test('Menampilkan panel daftar Latihan Lainnya di sisi kanan', async ({ page }) => {
    await expect(page.locator('h3:has-text("Latihan Lainnya")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('p:has-text("Belajar Huruf B")')).toBeVisible();
    await expect(page.locator('button:has-text("Kerjakan")').first()).toBeVisible();
  });

  // ==========================================
  // TC-18: Mengulang sesi (Coba Lagi)
  // ==========================================
  test('Fungsi tombol Coba Lagi mengarah kembali ke form latihan', async ({ page }) => {
    const btnCobaLagi = page.locator('button:has-text("Coba Lagi")');
    await expect(btnCobaLagi).toBeVisible({ timeout: 5000 });
    await btnCobaLagi.click();
    
    // Cek perpindahan URL ke halaman latihan soal lama
    await page.waitForURL('**/modul/modul-123/latihan', { timeout: 5000 });
    expect(page.url()).toContain('/modul/modul-123/latihan');
  });

  // ==========================================
  // TC-19: Melanjutkan latihan (Kerjakan)
  // ==========================================
  test('Fungsi tombol Kerjakan mengarah ke latihan soal baru', async ({ page }) => {
    const btnKerjakan = page.locator('button:has-text("Kerjakan")').first();
    await expect(btnKerjakan).toBeVisible({ timeout: 5000 });
    await btnKerjakan.click();
    
    // Cek perpindahan URL ke halaman latihan untuk soal baru
    await page.waitForURL('**/modul/modul-123/latihan', { timeout: 5000 });
    expect(page.url()).toContain('/modul/modul-123/latihan');
  });

  // ==========================================
  // TC-20: Kembali ke Modul
  // ==========================================
  test('Fungsi tombol Kembali ke Modul mengarah ke halaman detail modul', async ({ page }) => {
    // Menargetkan tombol kembali yang berada di bawah tombol Coba Lagi
    const btnKembali = page.locator('button:has-text("Kembali ke Modul")').last();
    await expect(btnKembali).toBeVisible({ timeout: 5000 });
    await btnKembali.click();
    
    // Harus kembali ke menu silabus detail modul
    await page.waitForURL('**/modul/modul-123', { timeout: 5000 });
    expect(page.url()).toMatch(/\/modul\/modul-123$/);
  });

});