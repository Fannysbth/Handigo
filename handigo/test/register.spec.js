import { test, expect } from '@playwright/test';

const uniqueEmail = `user${Date.now()}@test.com`;

test.describe('Register Testing', () => {

  test('Register berhasil', async ({ page }) => {
    await page.goto('/register');

    // Menggunakan getByPlaceholder karena input di React tidak menggunakan atribut id
    await page.getByPlaceholder('Masukkan nama lengkap').fill('Andi');
    await page.getByPlaceholder('contoh@email.com').fill(uniqueEmail);
    await page.getByPlaceholder('Masukkan password (min 6 karakter)').fill('123456');
    await page.getByPlaceholder('Ulangi password').fill('123456');

    await page.click('button[type="submit"]');

    // Berdasarkan kode React, jika sukses akan muncul toast dan redirect ke /login
    await expect(page.locator('body')).toContainText(/Registrasi berhasil/i);
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Email sudah terdaftar', async ({ page }) => {
    await page.goto('/register');

    await page.getByPlaceholder('Masukkan nama lengkap').fill('Andi');
    await page.getByPlaceholder('contoh@email.com').fill('existing@test.com');
    await page.getByPlaceholder('Masukkan password (min 6 karakter)').fill('123456');
    await page.getByPlaceholder('Ulangi password').fill('123456');

    await page.click('button[type="submit"]');

    // Mengasumsikan API (registerUser) mengembalikan pesan error yang ditangkap toast
    await expect(page.locator('body')).toContainText(/gagal|sudah/i);
  });

  test('Password tidak cocok', async ({ page }) => {
    await page.goto('/register');

    await page.getByPlaceholder('Masukkan nama lengkap').fill('Budi');
    await page.getByPlaceholder('contoh@email.com').fill('budi@test.com');
    await page.getByPlaceholder('Masukkan password (min 6 karakter)').fill('123456');
    await page.getByPlaceholder('Ulangi password').fill('654321');

    await page.click('button[type="submit"]');

    // Sesuai dengan pesan dari toast.error("Password tidak cocok!")
    await expect(page.locator('body')).toContainText(/Password tidak cocok/i);
  });

  // Tambahan test case: validasi password minimal 6 karakter dari React code
  test('Password kurang dari 6 karakter', async ({ page }) => {
    await page.goto('/register');

    await page.getByPlaceholder('Masukkan nama lengkap').fill('Budi');
    await page.getByPlaceholder('contoh@email.com').fill('budi@test.com');
    await page.getByPlaceholder('Masukkan password (min 6 karakter)').fill('123');
    await page.getByPlaceholder('Ulangi password').fill('123');

    await page.click('button[type="submit"]');

    // Sesuai dengan pesan dari toast.error("Password minimal 6 karakter!")
    await expect(page.locator('body')).toContainText(/minimal 6 karakter/i);
  });

  test('Field kosong', async ({ page }) => {
    await page.goto('/register');

    await page.click('button[type="submit"]');

    // Karena input di React memiliki atribut 'required' (HTML5), form tidak akan disubmit.
    // Kita cukup memvalidasi bahwa URL tidak berubah (tetap di /register).
    await expect(page).toHaveURL(/.*\/register/);
  });

});