# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: google-login.spec.js >> Google Login & Complete Profile Testing >> Complete Profile dengan password tidak cocok
- Location: test\google-login.spec.js:70:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Password tidak cocok')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Password tidak cocok')

```

```yaml
- status: Data login Google tidak lengkap. Silakan coba login ulang.
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
  - textbox "contoh@email.com"
  - text: Password
  - textbox "Masukkan password"
  - button
  - text: Lupa Kata Sandi?
  - button "Masuk"
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
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Google Login & Complete Profile Testing', () => {
  4  | 
  5  |   // =========================================================================
  6  |   // 1. POSITIVE: Login Google berhasil, akun baru diarahkan ke Complete Profile
  7  |   // =========================================================================
  8  |   test('Login Google berhasil, akun baru diarahkan ke Complete Profile', async ({ page }) => {
  9  |     // Mock API googleLogin backend agar mengembalikan respons sesuai akun Dian
  10 |     await page.route('**/api/auth/google**', async (route) => {
  11 |       await route.fulfill({
  12 |         status: 200,
  13 |         contentType: 'application/json',
  14 |         body: JSON.stringify({
  15 |           needProfile: true,
  16 |           email: 'dian@gmail.com',
  17 |           full_name: 'Dian'
  18 |         })
  19 |       });
  20 |     });
  21 | 
  22 |     // Simulasi klik & kembali dari Google dengan membawa hash token di URL
  23 |     await page.goto('/login#id_token=mocked_google_token_dian');
  24 | 
  25 |     // Ekspektasi Plan: Halaman Complete Profile terbuka
  26 |     await page.waitForURL('**/complete-profile**');
  27 |     await expect(page).toHaveURL(/complete-profile/);
  28 | 
  29 |     // Ekspektasi Plan: Field Nama dan Email terisi otomatis (Read-Only / Disabled)
  30 |     const emailInput = page.locator('input').nth(0);
  31 |     const nameInput = page.locator('input').nth(1);
  32 | 
  33 |     await expect(emailInput).toHaveValue('dian@gmail.com');
  34 |     await expect(emailInput).toBeDisabled();
  35 |     
  36 |     await expect(nameInput).toHaveValue('Dian');
  37 |     await expect(nameInput).toBeDisabled();
  38 |   });
  39 | 
  40 |   // =========================================================================
  41 |   // 2. POSITIVE: Complete Profile berhasil setelah login Google
  42 |   // =========================================================================
  43 |   test('Complete Profile berhasil setelah login Google', async ({ page }) => {
  44 |     // Mock API untuk simpan profil sukses ke backend
  45 |     await page.route('**/api/auth/complete-profile**', async (route) => {
  46 |       await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
  47 |     });
  48 | 
  49 |     // Masuk ke halaman dengan state data Dian dari Google
  50 |     await page.goto('/login');
  51 |     await page.evaluate(() => {
  52 |       window.history.pushState({ email: 'dian@gmail.com', full_name: 'Dian' }, '', '/complete-profile');
  53 |     });
  54 |     await page.reload();
  55 | 
  56 |     // Data Input sesuai Plan: password & konfirmasi sama (dian1234)
  57 |     await page.locator('input[type="password"]').nth(0).fill('dian1234');
  58 |     await page.locator('input[type="password"]').nth(1).fill('dian1234');
  59 | 
  60 |     await page.locator('button', { hasText: 'Simpan & Login' }).click();
  61 | 
  62 |     // Ekspektasi Plan: Diarahkan ke dashboard
  63 |     await page.waitForURL('**/dashboard**');
  64 |     await expect(page).toHaveURL(/dashboard/);
  65 |   });
  66 | 
  67 |   // =========================================================================
  68 |   // 3. NEGATIVE: Complete Profile dengan password tidak cocok
  69 |   // =========================================================================
  70 |   test('Complete Profile dengan password tidak cocok', async ({ page }) => {
  71 |     // Masuk ke halaman dengan state data Dian dari Google
  72 |     await page.goto('/login');
  73 |     await page.evaluate(() => {
  74 |       window.history.pushState({ email: 'dian@gmail.com', full_name: 'Dian' }, '', '/complete-profile');
  75 |     });
  76 |     await page.reload();
  77 | 
  78 |     // Data Input sesuai Plan: password beda (dian1234 vs dian9999)
  79 |     await page.locator('input[type="password"]').nth(0).fill('dian1234');
  80 |     await page.locator('input[type="password"]').nth(1).fill('dian9999');
  81 | 
  82 |     await page.locator('button', { hasText: 'Simpan & Login' }).click();
  83 | 
  84 |     // Ekspektasi Plan: Muncul pesan error "Password tidak cocok"
  85 |     const toastError = page.locator('text=Password tidak cocok');
> 86 |     await expect(toastError).toBeVisible();
     |                              ^ Error: expect(locator).toBeVisible() failed
  87 | 
  88 |     // Profil tidak tersimpan (Tetap di halaman complete-profile, tidak ke dashboard)
  89 |     await expect(page).toHaveURL(/complete-profile/);
  90 |   });
  91 | 
  92 | });
```