import { test, expect } from '@playwright/test';

// Menggunakan data mock sesuai dengan spesifikasi database kamu
const mockModule = {
  id: 'a2000000-0000-0000-0000-000000000002',
  title: 'Angka',
  description: 'Setelah menguasai alfabet, pelajari angka 1-9 dalam BISINDO.',
  total_exercises: 2,
  image_url: ''
};

const mockExercises = [
  { 
    id: '2495bd1c-3c17-48db-b387-300fdf7ecc91', 
    title: 'Angka Dasar 6-9', 
    sort_order: 1 
  }
];

const user = {
  email: 'handigo@gmail.com',
  password: 'handigo123'
};

test.describe('Learning Module Testing', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Mocking daftar modul (Endpoint API backend kamu)
    await page.route('**/api/modules', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockModule])
      });
    });

    // 2. Mocking detail modul berdasarkan ID
    await page.route(`**/api/module/${mockModule.id}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockModule)
      });
    });

    // 3. Mocking data daftar exercise
    await page.route(`**/api/exercises/${mockModule.id}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockExercises)
      });
    });

    // 4. Mocking progress map agar aman saat di-render ModuleListPage
    await page.route('**/api/progress', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
  });

  // =========================================================================
  // 1. POSITIVE: Pengguna membuka daftar modul setelah login
  // =========================================================================
  test('Halaman modul tampil', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('contoh@email.com').fill(user.email);
    await page.getByPlaceholder('Masukkan password').fill(user.password);
    await page.click('button[type="submit"]');

    // Menunggu validasi redirect ke halaman dashboard bawaan router
    await expect(page).toHaveURL(/.*\/dashboard/);

    // SESUAI ROUTE FE: navigasi diarahkan ke '/modul'
    await page.goto('/modul');
    await expect(page.locator('body')).toContainText('Angka');
    await expect(page.getByRole('button', { name: 'Lihat Modul' })).toBeVisible();
  });

  // =========================================================================
  // 2. POSITIVE: Membuka detail modul dan melihat deskripsi
  // =========================================================================
  test('Buka detail modul', async ({ page }) => {
    // Navigasi langsung menuju rute detail modul '/modul/:id'
    await page.goto(`/modul/${mockModule.id}`); 

    await expect(page.locator('h1')).toContainText('Angka');
    await expect(page.getByRole('button', { name: 'Login untuk memulai' })).toBeVisible();
  });

  // =========================================================================
  // 3. POSITIVE: Pengguna memulai modul dari halaman detail
  // =========================================================================
  test('Mulai pembelajaran / latihan', async ({ page }) => {
    // Login terlebih dahulu untuk mengisi token auth session
    await page.goto('/login');
    await page.getByPlaceholder('contoh@email.com').fill(user.email);
    await page.getByPlaceholder('Masukkan password').fill(user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Buka rute list '/modul' dan klik tombol navigasi internal agar state user ikut terbawa
    await page.goto('/modul');
    await page.getByRole('button', { name: 'Lihat Modul' }).click();

    // Verifikasi tombol 'Mulai Latihan' aktif dan klik
    const startButton = page.getByRole('button', { name: 'Mulai Latihan' });
    await expect(startButton).toBeVisible();
    await startButton.click();

    // SESUAI ROUTE FE: Dialihkan ke halaman latihan ber-auth '/modul/:id/latihan'
    await expect(page).toHaveURL(new RegExp(`/modul/${mockModule.id}/latihan`));
  });

  // =========================================================================
  // 4. NEGATIVE: Fitur Terkunci (Skenario jika belum login)
  // =========================================================================
  test('Modul terkunci jika user belum login', async ({ page }) => {
    // Bersihkan cookies untuk mensimulasikan unauthenticated guest
    await page.context().clearCookies();
    
    await page.goto(`/modul/${mockModule.id}`);

    const lockButton = page.getByRole('button', { name: 'Login untuk memulai' });
    await expect(lockButton).toBeVisible();
    await expect(lockButton).toBeDisabled();

    // Memastikan kartu ExerciseCard menampilkan instruksi penguncian auth
    await expect(page.locator('body')).toContainText('Login untuk akses');
  });

});