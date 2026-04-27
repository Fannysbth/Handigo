const express = require('express');
const router = express.Router();
const { getExerciseById, saveExerciseResult, getUserResults } = require('../controllers/exercise.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/results', authenticate, getUserResults);           // History hasil latihan user
router.get('/:id', getExerciseById);                           // Detail 1 exercise (publik)
router.post('/:id/result', authenticate, saveExerciseResult);  // Simpan hasil latihan

module.exports = router;