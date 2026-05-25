# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: google-login.spec.js >> Google Login & Complete Profile Testing >> Complete Profile berhasil setelah login Google
- Location: test\google-login.spec.js:43:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard**" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7] [cursor=pointer]:
        - img "Handigo Logo" [ref=e8]
        - generic [ref=e9]: Handigo
      - generic [ref=e11]:
        - link "Masuk" [ref=e12] [cursor=pointer]:
          - /url: /login
        - link "Daftar" [ref=e13] [cursor=pointer]:
          - /url: /register
  - main [ref=e14]:
    - generic [ref=e18]:
      - heading "Selamat Datang!" [level=1] [ref=e19]
      - paragraph [ref=e20]: Masuk untuk melanjutkan belajarmu
      - generic [ref=e21]:
        - generic [ref=e22]:
          - text: Email
          - textbox "contoh@email.com" [ref=e23]
        - generic [ref=e24]:
          - text: Password
          - textbox "Masukkan password" [ref=e25]
          - button [ref=e26] [cursor=pointer]:
            - img [ref=e27]
        - generic [ref=e30] [cursor=pointer]: Lupa Kata Sandi?
        - button "Masuk" [ref=e31] [cursor=pointer]
        - generic [ref=e34]: Atau
        - link "Daftar Akun" [ref=e36] [cursor=pointer]:
          - /url: /register
        - button "Google Lanjutkan dengan Google" [ref=e38] [cursor=pointer]:
          - img "Google" [ref=e39]
          - text: Lanjutkan dengan Google
  - contentinfo [ref=e40]:
    - generic [ref=e41]:
      - generic [ref=e42]:
        - img "Logo" [ref=e43]
        - generic [ref=e44]: Handigo © 2026 | Dibuat oleh Handy Team — DTETI FT UGM
      - generic [ref=e45]:
        - link "Privacy" [ref=e46] [cursor=pointer]:
          - /url: /login
        - link "Terms" [ref=e47] [cursor=pointer]:
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
> 63 |     await page.waitForURL('**/dashboard**');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
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
  86 |     await expect(toastError).toBeVisible();
  87 | 
  88 |     // Profil tidak tersimpan (Tetap di halaman complete-profile, tidak ke dashboard)
  89 |     await expect(page).toHaveURL(/complete-profile/);
  90 |   });
  91 | 
  92 | });
```