import { test, expect } from '@playwright/test';

test.describe('Dashboard Progress & History Testing', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Proses Login ke Aplikasi
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'handigo@gmail.com');
    await page.fill('input[type="password"]', 'handigo123');
    await page.click('button[type="submit"]');
    
    // Tunggu redirect ke dashboard selesai
    await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => null);
  });

  // ==========================================
  // TC-1: User sudah punya progress (Positive)
  // ==========================================
  test('Lihat halaman progress setelah menyelesaikan beberapa modul', async ({ page }) => {
    await page.route('**/progress*', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([
        { module_id: 1, progress_percentage: 100 }, 
        { module_id: 2, progress_percentage: 100 },
        { module_id: 3, progress_percentage: 50 }
      ])
    }));
    await page.route('**/results*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/last*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
    await page.route('**/profile*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ full_name: 'Handigo' }) }));

    await page.reload();

    await expect(page.getByText('Halo, Handigo!')).toBeVisible();

    // PERBAIKAN LOCATOR: Tambahkan class spesifik .bg-dark-gray milik StatCard
    const modulSelesaiStat = page.locator('.bg-dark-gray').filter({ hasText: 'Modul Selesai' }).locator('h3');
    
    await expect(modulSelesaiStat).toHaveText('2');
    await expect(page.getByRole('heading', { name: 'Grafik Akurasi Mingguan' })).toBeVisible();
  });

  // ==========================================
  // TC-2: Progress tersinkronisasi antar tab/device (Positive)
  // ==========================================
  test('Progress tersinkronisasi saat dibuka di tab baru (Data Cloud)', async ({ page, context }) => {
    const mockProgress = JSON.stringify([{ module_id: 1, progress_percentage: 100 }]);
    
    await page.route('**/progress*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: mockProgress }));
    await page.route('**/results*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/last*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
    await page.route('**/profile*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));

    await page.reload();

    // PERBAIKAN LOCATOR
    const statTab1 = page.locator('.bg-dark-gray').filter({ hasText: 'Modul Selesai' }).locator('h3');
    await expect(statTab1).toHaveText('1');

    const newPage = await context.newPage();
    
    await newPage.route('**/progress*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: mockProgress }));
    await newPage.route('**/results*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await newPage.route('**/last*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
    await newPage.route('**/profile*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));

    await newPage.goto('http://localhost:5173/dashboard');

    // PERBAIKAN LOCATOR
    const statTab2 = newPage.locator('.bg-dark-gray').filter({ hasText: 'Modul Selesai' }).locator('h3');
    await expect(statTab2).toHaveText('1');
  });

  // ==========================================
  // TC-3: Melihat Riwayat Latihan (Positive)
  // ==========================================
  test('Melihat riwayat sesi latihan yang telah selesai', async ({ page }) => {
    const todayISO = new Date().toISOString();

    await page.route('**/results*', (route) => route.fulfill({ 
      status: 200, contentType: 'application/json',
      body: JSON.stringify([{ 
        id: 'res-1', 
        created_at: todayISO, 
        accuracy: 100,
        modules: { title: 'Modul Alfabet' },
        exercises: { title: 'Latihan 1: Huruf A' }
      }]) 
    }));
    
    await page.route('**/progress*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/last*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
    await page.route('**/profile*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));

    await page.reload();

    await expect(page.getByRole('heading', { name: 'Riwayat Latihan' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    
    await expect(page.getByRole('cell', { name: 'Modul Alfabet' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('cell', { name: 'Latihan 1: Huruf A' })).toBeVisible();
  });

  // ==========================================
  // TC-4: User Baru / Belum ada progress (Negative)
  // ==========================================
  test('Lihat progress saat belum menyelesaikan modul apapun', async ({ page }) => {
    await page.route('**/progress*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/results*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/last*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
    await page.route('**/profile*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));

    await page.reload();

    // PERBAIKAN LOCATOR
    const modulSelesaiStat = page.locator('.bg-dark-gray').filter({ hasText: 'Modul Selesai' }).locator('h3');
    await expect(modulSelesaiStat).toHaveText('0');
    
    await expect(page.getByText('Belum ada data. Mulai latihan untuk melihat grafik.')).toBeVisible();
    await expect(page.getByText('Belum ada riwayat latihan.')).toBeVisible();
  });

});