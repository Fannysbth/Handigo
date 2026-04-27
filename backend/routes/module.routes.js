const express = require('express');
const router = express.Router();
const { getModules, getModuleById, getModuleExercises } = require('../controllers/module.controller');

// Semua endpoint modul publik (tidak perlu login untuk lihat)
router.get('/', getModules);
router.get('/:id', getModuleById);
router.get('/:id/exercises', getModuleExercises);

module.exports = router;