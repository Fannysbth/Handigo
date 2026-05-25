import { test, expect } from '@playwright/test';

test.describe('Google Login & Complete Profile Testing', () => {

  // =========================================================================
  // 1. POSITIVE: Login Google berhasil, akun baru diarahkan ke Complete Profile
  // =========================================================================
  test('Login Google berhasil, akun baru diarahkan ke Complete Profile', async ({ page }) => {
    // Mock API googleLogin backend agar mengembalikan respons sesuai akun Dian
    await page.route('**/api/auth/google**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          needProfile: true,
          email: 'dian@gmail.com',
          full_name: 'Dian'
        })
      });
    });

    // Simulasi klik & kembali dari Google dengan membawa hash token di URL
    await page.goto('/login#id_token=mocked_google_token_dian');

    // Ekspektasi Plan: Halaman Complete Profile terbuka
    await page.waitForURL('**/complete-profile**');
    await expect(page).toHaveURL(/complete-profile/);

    // Ekspektasi Plan: Field Nama dan Email terisi otomatis (Read-Only / Disabled)
    const emailInput = page.locator('input').nth(0);
    const nameInput = page.locator('input').nth(1);

    await expect(emailInput).toHaveValue('dian@gmail.com');
    await expect(emailInput).toBeDisabled();
    
    await expect(nameInput).toHaveValue('Dian');
    await expect(nameInput).toBeDisabled();
  });

  // =========================================================================
  // 2. POSITIVE: Complete Profile berhasil setelah login Google
  // =========================================================================
  test('Complete Profile berhasil setelah login Google', async ({ page }) => {
    // Mock API untuk simpan profil sukses ke backend
    await page.route('**/api/auth/complete-profile**', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    // Masuk ke halaman dengan state data Dian dari Google
    await page.goto('/login');
    await page.evaluate(() => {
      window.history.pushState({ email: 'dian@gmail.com', full_name: 'Dian' }, '', '/complete-profile');
    });
    await page.reload();

    // Data Input sesuai Plan: password & konfirmasi sama (dian1234)
    await page.locator('input[type="password"]').nth(0).fill('dian1234');
    await page.locator('input[type="password"]').nth(1).fill('dian1234');

    await page.locator('button', { hasText: 'Simpan & Login' }).click();

    // Ekspektasi Plan: Diarahkan ke dashboard
    await page.waitForURL('**/dashboard**');
    await expect(page).toHaveURL(/dashboard/);
  });

  // =========================================================================
  // 3. NEGATIVE: Complete Profile dengan password tidak cocok
  // =========================================================================
  test('Complete Profile dengan password tidak cocok', async ({ page }) => {
    // Masuk ke halaman dengan state data Dian dari Google
    await page.goto('/login');
    await page.evaluate(() => {
      window.history.pushState({ email: 'dian@gmail.com', full_name: 'Dian' }, '', '/complete-profile');
    });
    await page.reload();

    // Data Input sesuai Plan: password beda (dian1234 vs dian9999)
    await page.locator('input[type="password"]').nth(0).fill('dian1234');
    await page.locator('input[type="password"]').nth(1).fill('dian9999');

    await page.locator('button', { hasText: 'Simpan & Login' }).click();

    // Ekspektasi Plan: Muncul pesan error "Password tidak cocok"
    const toastError = page.locator('text=Password tidak cocok');
    await expect(toastError).toBeVisible();

    // Profil tidak tersimpan (Tetap di halaman complete-profile, tidak ke dashboard)
    await expect(page).toHaveURL(/complete-profile/);
  });

});