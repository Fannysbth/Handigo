import { apiFetch } from './http';

// WAJIB ADA DI BARIS PALING ATAS

/**
 * =========================
 * MODULES
 * =========================
 */

export const fetchModules = () => {
  return apiFetch('/modules');
};

export const fetchModuleById = (id) => {
  return apiFetch(`/modules/${id}`);
};

export const fetchExercises = (moduleId) => {
  return apiFetch(`/modules/${moduleId}/exercises`);
};

// Alias (biar FE tidak perlu tahu struktur BE)
export const fetchModuleExercises = fetchExercises;


export const fetchExerciseById = (exerciseId) => {
  return apiFetch(`/exercises/${exerciseId}`);
};

export const saveExerciseResult = (exerciseId, payload) => {
  return apiFetch(`/exercises/${exerciseId}/result`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const fetchUserResults = (limit = 20) => {
  return apiFetch(`/exercises/results?limit=${limit}`);
};

export const fetchLatestResult = () => {
  return apiFetch('/exercises/results/latest');
};

// Kebutuhan halaman ResultPage agar:
// kiri = latihan terakhir
// kanan = latihan berikutnya yang belum selesai (atau rekomendasi)
export const fetchLatestResultAndNextExercises = (moduleId) => {
  return apiFetch(`/exercises/results/latest/next?module_id=${moduleId}`);
};


/**
 * =========================
 * DETECTION
 * =========================
 */

export const verifySign = (payload) => {
  return apiFetch('/detection/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const fetchDetectionStatus = () => {
  return apiFetch('/detection/status');
};

/**
 * =========================
 * PROGRESS
 * =========================
 */

export const fetchModuleProgress = (moduleId) => {
  return apiFetch(`/progress/${moduleId}`);
};

export const fetchAllProgress = () => {
  return apiFetch('/progress');
};

export const upsertProgress = (moduleId, payload) => {
  return apiFetch(`/progress/${moduleId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const fetchLastAccessedModule = () => {
  return apiFetch('/progress/last-accessed');
};

export const fetchDashboardStats = () => {
  return apiFetch('/progress/dashboard');
};

/**
 * =========================
 * PROFILE
 * =========================
 */

export const fetchProfile = () => {
  return apiFetch('/profile');
};

export const updateProfile = (payload) => {
  return apiFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

/**
 * =========================
 * AUTH
 * =========================
 */

export const registerUser = (email, password, full_name) => {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name }),
  });
};

export const loginUser = (email, password) => {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const logoutUser = () => {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
};

export const getMe = () => {
  return apiFetch('/auth/me');
};

export const googleLogin = (credential) => {
  return apiFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
};

export const completeProfile = (email, password, full_name) => {
  return apiFetch('/auth/complete-profile', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name }),
  });
};

