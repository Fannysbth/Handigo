const express = require('express');
const router = express.Router();
const {
  getAllProgress,
  getModuleProgress,
  upsertModuleProgress,
  getLastAccessed,
  getDashboardStats,
} = require('../controllers/progress.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Semua progress butuh auth
router.use(authenticate);

router.get('/', getAllProgress);
router.get('/last-accessed', getLastAccessed);
router.get('/dashboard', getDashboardStats);
router.get('/:moduleId', getModuleProgress);
router.put('/:moduleId', upsertModuleProgress);

module.exports = router;