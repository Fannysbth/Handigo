const express = require('express');
const router = express.Router();

const {
  getExerciseById,
  saveExerciseResult,
  getUserResults,
  getLatestResult,
  getLatestResultAndRecommendedNext,
} = require('../controllers/exercise.controller');

const { authenticate } = require('../middleware/auth.middleware');


// =========================
// RESULTS ROUTES (WAJIB DI ATAS)
// =========================

// ambil history hasil latihan user
router.get('/results', authenticate, getUserResults);

// ambil hasil latihan terakhir
router.get('/results/latest', authenticate, getLatestResult);

// ambil hasil terakhir + rekomendasi latihan berikutnya
router.get(
  '/results/latest/next',
  authenticate,
  getLatestResultAndRecommendedNext
);


// =========================
// EXERCISE ROUTES
// =========================

// detail 1 exercise (public)
router.get('/:id', getExerciseById);

// simpan hasil latihan
router.post('/:id/result', authenticate, saveExerciseResult);


module.exports = router;