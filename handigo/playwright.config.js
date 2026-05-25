import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test', // Mengarah ke folder 'test' kamu
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173', // Memperbaiki error invalid URL kemarin
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
});