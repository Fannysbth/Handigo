import { test, expect } from '@playwright/test';

const user = {
  email: 'handigo@gmail.com',
  password: 'handigo123'
};

test.describe('Login Testing', () => {

  // 1. SKENARIO POSITIF: LOGIN BERHASIL
  test('Login berhasil', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('contoh@email.com').fill(user.email);
    await page.getByPlaceholder('Masukkan password').fill(user.password);

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  // 2. SKENARIO NEGATIF: PASSWORD SALAH
  test('Password salah', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('contoh@email.com').fill(user.email);
    await page.getByPlaceholder('Masukkan password').fill('wrongpassword'); // Mengisi password salah

    await page.click('button[type="submit"]');

    await expect(page.locator('body')).toContainText(/Email atau password salah/i);
  });

  // 3. SKENARIO NEGATIF: EMAIL TIDAK TERDAFTAR
  test('Email tidak ditemukan', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('contoh@email.com').fill('random@gmail.com'); // Mengisi email acak/belum terdaftar
    await page.getByPlaceholder('Masukkan password').fill(user.password);

    await page.click('button[type="submit"]');

    await expect(page.locator('body')).toContainText(/Email atau password salah/i);
  });

  // 4. SKENARIO NEGATIF: FIELD KOSONG
  test('Field kosong', async ({ page }) => {
    await page.goto('/login');

    await page.click('button[type="submit"]');

    // Karena input React menggunakan 'required', form diblokir browser dan URL tetap di halaman login
    await expect(page).toHaveURL(/.*\/login/);
  });

});