# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: module.spec.js >> Learning Module Testing >> Halaman modul tampil
- Location: test\module.spec.js:68:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/dashboard/
Received string:  "http://localhost:5173/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    8 × unexpected value "http://localhost:5173/login"

```

```yaml
- navigation:
  - img "Handigo Logo"
  - text: Handigo
  - link "Masuk":
    - /url: /login
  - link "Daftar":
    - /url: /register
- main:
  - heading "Selamat Datang!" [level=1]
  - paragraph: Masuk untuk melanjutkan belajarmu
  - text: Email
  - textbox "contoh@email.com": handigo@gmail.com
  - text: Password
  - textbox "Masukkan password": handigo123
  - button
  - text: Lupa Kata Sandi?
  - button "Masuk..." [disabled]
  - text: Atau
  - link "Daftar Akun":
    - /url: /register
  - button "Google Lanjutkan dengan Google":
    - img "Google"
    - text: Lanjutkan dengan Google
- contentinfo:
  - img "Logo"
  - text: Handigo © 2026 | Dibuat oleh Handy Team — DTETI FT UGM
  - link "Privacy":
    - /url: /login
  - link "Terms":
    - /url: /login
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Menggunakan data mock sesuai dengan spesifikasi database kamu
  4   | const mockModule = {
  5   |   id: 'a2000000-0000-0000-0000-000000000002',
  6   |   title: 'Angka',
  7   |   description: 'Setelah menguasai alfabet, pelajari angka 1-9 dalam BISINDO.',
  8   |   total_exercises: 2,
  9   |   image_url: ''
  10  | };
  11  | 
  12  | const mockExercises = [
  13  |   { 
  14  |     id: '2495bd1c-3c17-48db-b387-300fdf7ecc91', 
  15  |     title: 'Angka Dasar 6-9', 
  16  |     sort_order: 1 
  17  |   }
  18  | ];
  19  | 
  20  | const user = {
  21  |   email: 'handigo@gmail.com',
  22  |   password: 'handigo123'
  23  | };
  24  | 
  25  | test.describe('Learning Module Testing', () => {
  26  | 
  27  |   test.beforeEach(async ({ page }) => {
  28  |     // 1. Mocking daftar modul (Endpoint API backend kamu)
  29  |     await page.route('**/api/modules', async (route) => {
  30  |       await route.fulfill({
  31  |         status: 200,
  32  |         contentType: 'application/json',
  33  |         body: JSON.stringify([mockModule])
  34  |       });
  35  |     });
  36  | 
  37  |     // 2. Mocking detail modul berdasarkan ID
  38  |     await page.route(`**/api/module/${mockModule.id}`, async (route) => {
  39  |       await route.fulfill({
  40  |         status: 200,
  41  |         contentType: 'application/json',
  42  |         body: JSON.stringify(mockModule)
  43  |       });
  44  |     });
  45  | 
  46  |     // 3. Mocking data daftar exercise
  47  |     await page.route(`**/api/exercises/${mockModule.id}`, async (route) => {
  48  |       await route.fulfill({
  49  |         status: 200,
  50  |         contentType: 'application/json',
  51  |         body: JSON.stringify(mockExercises)
  52  |       });
  53  |     });
  54  | 
  55  |     // 4. Mocking progress map agar aman saat di-render ModuleListPage
  56  |     await page.route('**/api/progress', async (route) => {
  57  |       await route.fulfill({
  58  |         status: 200,
  59  |         contentType: 'application/json',
  60  |         body: JSON.stringify([])
  61  |       });
  62  |     });
  63  |   });
  64  | 
  65  |   // =========================================================================
  66  |   // 1. POSITIVE: Pengguna membuka daftar modul setelah login
  67  |   // =========================================================================
  68  |   test('Halaman modul tampil', async ({ page }) => {
  69  |     await page.goto('/login');
  70  |     await page.getByPlaceholder('contoh@email.com').fill(user.email);
  71  |     await page.getByPlaceholder('Masukkan password').fill(user.password);
  72  |     await page.click('button[type="submit"]');
  73  | 
  74  |     // Menunggu validasi redirect ke halaman dashboard bawaan router
> 75  |     await expect(page).toHaveURL(/.*\/dashboard/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  76  | 
  77  |     // SESUAI ROUTE FE: navigasi diarahkan ke '/modul'
  78  |     await page.goto('/modul');
  79  |     await expect(page.locator('body')).toContainText('Angka');
  80  |     await expect(page.getByRole('button', { name: 'Lihat Modul' })).toBeVisible();
  81  |   });
  82  | 
  83  |   // =========================================================================
  84  |   // 2. POSITIVE: Membuka detail modul dan melihat deskripsi
  85  |   // =========================================================================
  86  |   test('Buka detail modul', async ({ page }) => {
  87  |     // Navigasi langsung menuju rute detail modul '/modul/:id'
  88  |     await page.goto(`/modul/${mockModule.id}`); 
  89  | 
  90  |     await expect(page.locator('h1')).toContainText('Angka');
  91  |     await expect(page.getByRole('button', { name: 'Login untuk memulai' })).toBeVisible();
  92  |   });
  93  | 
  94  |   // =========================================================================
  95  |   // 3. POSITIVE: Pengguna memulai modul dari halaman detail
  96  |   // =========================================================================
  97  |   test('Mulai pembelajaran / latihan', async ({ page }) => {
  98  |     // Login terlebih dahulu untuk mengisi token auth session
  99  |     await page.goto('/login');
  100 |     await page.getByPlaceholder('contoh@email.com').fill(user.email);
  101 |     await page.getByPlaceholder('Masukkan password').fill(user.password);
  102 |     await page.click('button[type="submit"]');
  103 |     await expect(page).toHaveURL(/.*\/dashboard/);
  104 | 
  105 |     // Buka rute list '/modul' dan klik tombol navigasi internal agar state user ikut terbawa
  106 |     await page.goto('/modul');
  107 |     await page.getByRole('button', { name: 'Lihat Modul' }).click();
  108 | 
  109 |     // Verifikasi tombol 'Mulai Latihan' aktif dan klik
  110 |     const startButton = page.getByRole('button', { name: 'Mulai Latihan' });
  111 |     await expect(startButton).toBeVisible();
  112 |     await startButton.click();
  113 | 
  114 |     // SESUAI ROUTE FE: Dialihkan ke halaman latihan ber-auth '/modul/:id/latihan'
  115 |     await expect(page).toHaveURL(new RegExp(`/modul/${mockModule.id}/latihan`));
  116 |   });
  117 | 
  118 |   // =========================================================================
  119 |   // 4. NEGATIVE: Fitur Terkunci (Skenario jika belum login)
  120 |   // =========================================================================
  121 |   test('Modul terkunci jika user belum login', async ({ page }) => {
  122 |     // Bersihkan cookies untuk mensimulasikan unauthenticated guest
  123 |     await page.context().clearCookies();
  124 |     
  125 |     await page.goto(`/modul/${mockModule.id}`);
  126 | 
  127 |     const lockButton = page.getByRole('button', { name: 'Login untuk memulai' });
  128 |     await expect(lockButton).toBeVisible();
  129 |     await expect(lockButton).toBeDisabled();
  130 | 
  131 |     // Memastikan kartu ExerciseCard menampilkan instruksi penguncian auth
  132 |     await expect(page.locator('body')).toContainText('Login untuk akses');
  133 |   });
  134 | 
  135 | });
```